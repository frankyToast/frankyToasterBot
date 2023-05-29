from mcrcon import MCRcon

with MCRcon("10.1.1.1", "sekret") as mcr:
    resp = mcr.command("/whitelist add bob")
    print(resp)
   
   
mcr = MCRcon("10.1.1.1", "sekret")
mcr.connect()
resp = mcr.command("/whitelist add bob")
print(resp)
mcr.disconnect()