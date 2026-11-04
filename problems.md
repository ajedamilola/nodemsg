# Relax its just problems i found along the way that i fixed

- How promises fail for recurring events. so i normally resolve the socket using promises. but once the first socket/promise is resolved the subsequent onces fails
- Keeping track of the clients using the info the server has and relating it to the topic id there were listening to so i can cleanup upon the client disconnect
- mutiple messages can send and the server recieves it as ONE event with the data conjoined. i dont have control over this fact but what i can control is what happens when this occurs. ("sticky packet" problem)
