# define

AMD-like:  I'm not worried about following the full specification.  It would be nice if it worked (and I don't see why it won't...), but it really just has to work for me.

The major component of it, is that each dependency will auto-create a Promise-like Q.  When many deps are required, the promises are chained together with ".and".  We need to track the dependencies and map them to the function arguments.


So, every call to define has 3 args:
- "id"
- [deps]
- function

id is optional.  If omitted, it uses the name of the file.  I can try to resolve these like Common JS does, to keep most of my code in tact.

Ok, so if this plays out how I think - I'll have hundreds of defines(), each relying on more deps.

So, we have an "entry" type of thing.   And the main script will depend on several deps, each of which will depend on more.  I can iron out optimizations later, lets just get the general thing working.

Ok, so entry might be anonymous.  Most are probably anonymous..

define(["unprefixed", "deps"])

Unprefixed with ./ or ../, it is a "global" dependency.  We can either try to resolve this on the client side, or the server side.  In dev mode, even if this 404s once, and then tries again.. I don't see a problem with that.  It should happen relatively instantly...

Because I need these modules to work on the server also, I need to keep the nested node_modules pattern.  It might be handy to have node_modules available..

And, I might be able to bundle portions with webpack, and export them for AMD consumption, making the best of both worlds.

Ok - so... where do we start?  I might not even need a base class...

Should define return a module of some kind?  It can probably just be a global function.  Ahh, yes, but I need the Promise-Q.  