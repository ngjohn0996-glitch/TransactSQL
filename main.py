#connect to database ----------------------------------------------------------------------------------------------------
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

database_url = "mysql+pymysql://root:mysql123@localhost:3306/database_01"
engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



#create table ------------------------------------------------------------------------------------------------------------
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from datetime import date

Base = declarative_base()

class User(Base):
  __tablename__ = "users"
  user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  username = Column(String(100), nullable=False)
  password = Column(String(500))
  occupation = Column(String(100))
  age = Column(Integer)
  country = Column(String(100))

  transaction = relationship("Transaction", back_populates="user")   #2) one to many >> relationship

class Transaction(Base):
  __tablename__ = "transactions"
  transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  company_id = Column(Integer)
  transaction_date = Column(String(20), default=date.today().isoformat())
  cash_flow = Column(Boolean)
  cash_amount = Column(Float)
  transaction_category = Column(String(200))

  user_id = Column(Integer, ForeignKey("users.user_id"))      #1) one to many >> Foreignkey
  user = relationship("User", back_populates="transaction")   #2) one to many >> relationship

Base.metadata.create_all(bind=engine)



#interact with database -------------------------------------------------------------------------------------------------
from sqlalchemy.orm import Session

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()



#import backend ----------------------------------------------------------------------------------------------------------
from fastapi import FastAPI

app = FastAPI()



#allow react app ---------------------------------------------------------------------------------------------------------
from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:5173"]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)



#data validation --------------------------------------------------------------------------------------------------------
from pydantic import BaseModel, Field, constr
from typing import List
from datetime import datetime
from typing import Optional   #default value >> assign value, optional >> validate none(read only for self-understand)      

class userCreatebase(BaseModel):
  username : constr(strip_whitespace=True, min_length=1)        
  password : str
  occupation : str 
  age : int 
  country : str 

class userReadbase(userCreatebase):
  user_id : int  

class tokenbase(BaseModel):
  access_token : str
  token_type : str  

class transactionCreatebase(BaseModel):  
  company_id : int
  transaction_date : str = Field(default_factory=lambda: date.today().isoformat())   #pydantic assign value
  cash_flow : bool                                                                   #defaultfactory>> renew value data 
  cash_amount : float
  transaction_category : str 

class transactionReadbase(transactionCreatebase): 
  transaction_id : int   #database assign value, pydantic assign none(unnecessary)  
  user_id : int   #encode assign value, pydantic assign none(unnecessary)    
   


#authentication ----------------------------------------------------------------------------------------------------
from fastapi import Depends, HTTPException
from passlib.context import CryptContext
bcrypt_context = CryptContext (schemes=["bcrypt"], deprecated="auto")   #db_add hashpassword

@app.post("/register_user", response_model=userReadbase) 
async def insert_user(user:userCreatebase, db:Session = Depends(get_db)):
  db_user = db.query(User).filter(User.username == user.username).first()
  if db_user:
    raise HTTPException(status_code=400, detail="Username already registered.")    
  db_add = User(username=user.username, password=bcrypt_context.hash(user.password), occupation=user.occupation, age=user.age, country=user.country)
  db.add(db_add)
  db.commit()
  return db_add
  
 


from fastapi.security import OAuth2PasswordRequestForm 
from fastapi import status  
from datetime import datetime, timedelta
from jose import jwt 

@app.post("/token",response_model=tokenbase)  
async def get_token(form:OAuth2PasswordRequestForm = Depends(), db:Session = Depends(get_db)):   #fill form contents
  #auth form contents with database
  user = db.query(User).filter(form.username == User.username).first()
  if not user:   #if not (no data = false)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Incorrect username")   

  if not bcrypt_context.verify(form.password, user.password):   #if not (password unmatch = false)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Incorrect password")  
     
  #encode + secretkey = token
  need_encoded = {"sub":user.username , "id":user.user_id}  
  expires_time = datetime.utcnow() + timedelta(minutes=20)
  need_encoded.update({"expire": expires_time.isoformat()})
  token = jwt.encode(need_encoded,"b1f3c9a7e4d8f2a1c3b6d7e8f9a0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f809", algorithm="HS256")
  return {"access_token":token, "token_type":"bearer"}




from fastapi.security import OAuth2PasswordBearer
oauth2_bearer = OAuth2PasswordBearer (tokenUrl="/token")   
from jose import JWTError

async def auth_decode(token = Depends(oauth2_bearer)):   #fill form, auth, encode have token   #(item=return def)
  #token - secretkey = encode
  try:
    payload = jwt.decode(token,"b1f3c9a7e4d8f2a1c3b6d7e8f9a0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f809", algorithms="HS256")
    username = payload.get("sub")
    user_id = payload.get("id")
    return {"username":username, "user_id":user_id}
  except JWTError:   #only decode when have token
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Did not have access token")  

   


#backend development ----------------------------------------------------------------------------------------------------
@app.post("/transaction", response_model=transactionReadbase)   #response_model=return data pass through validation
async def insert_transaction (tran: transactionCreatebase, db:Session = Depends(get_db), auth_fetch = Depends(auth_decode)):
  db_add = Transaction(**tran.dict(), user_id = auth_fetch["user_id"])   #table(**item.dict(), table.id = encode["id"])   
  db.add(db_add)                                                         #table.id acquire by encode, item no need table.id
  db.commit()
  return db_add

@app.get("/alltransaction", response_model=List[transactionReadbase])  
async def fetch_transaction (skip: int=0, limit: int=100, db:Session = Depends(get_db), auth_fetch = Depends(auth_decode)):
  db_fetch = db.query(Transaction).offset(skip).limit(limit).all()   #db.query(table)
  return db_fetch 

@app.get("/usertransaction", response_model=List[transactionReadbase]) 
async def fetch_usertransaction (db:Session = Depends(get_db), auth_fetch = Depends(auth_decode)):
  db_fetch = db.query(Transaction).filter(Transaction.user_id == auth_fetch["user_id"]).all()   #filter(table.id == encode["id"])
  if not db_fetch:
     raise HTTPException(status_code=404, detail="User not found")
  return db_fetch 

@app.delete("/deltransaction/{id}", response_model=transactionReadbase)   #axios.delete two argument, int value pass with route 
async def delete_transaction (id:int, db:Session = Depends(get_db), auth_fetch = Depends(auth_decode)):
  db_fetch = db.query(Transaction).filter(Transaction.transaction_id == id).first()
  if not db_fetch:
    raise HTTPException(status_code=404, detail="Transaction not found")
  db.delete(db_fetch)  
  db.commit()
  return db_fetch

@app.put("/edittransaction/{id}", response_model=transactionReadbase)
async def update_transaction (id:int, tran: transactionCreatebase, db:Session = Depends(get_db), auth_fetch = Depends(auth_decode)):
  db_fetch = db.query(Transaction).filter(Transaction.transaction_id == id).first()
  if not db_fetch:
    raise HTTPException(status_code=404, detail="Transaction not found")
  for key, value in tran.dict().items():
    setattr(db_fetch, key, value)   #db_fetch.item_key = item_value
  db.commit()  
  return db_fetch  

@app.get("/protected")  
async def get(auth_fetch = Depends(auth_decode)):   
  return {"Hello":"Hello"}




#error handle--------------------------------------------------------------------------------------------------------------------
from fastapi.exceptions import RequestValidationError
from fastapi import Request   #come with error handle, html render.....
from fastapi.responses import JSONResponse   #response in status code


@app.exception_handler(RequestValidationError)
async def handle_validation_err(request: Request, exc: RequestValidationError):
  return JSONResponse(status_code=422, 
                      content={"detail": "Invalid input", "more_details": exc.errors()})