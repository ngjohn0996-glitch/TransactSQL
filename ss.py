from fastapi import FastAPI

app = FastAPI()



#-----------------------------------------------------------------------------------------------------------------------------
@app.get("/get1")           # get no need input 
async def root():   

  return {"Hello":"World","Hello2":{"a":"b","c":"d"}}

@app.get("/get2")           # get no need input 
async def root(x:int=3):    # x use default value, no need input

  return {x}


@app.post("/post1")         # post need input (even html have input)
async def root():   

  return {"Hello":"World"}  

@app.post("/post2")         # post need input (even html have input)
async def root(x:int=3):    # x has default value, still need input

  return {x}    
  