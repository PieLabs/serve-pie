# Notes

## Things that are unclear

* roles - instructor/student
* changing env triggers a call to processing.getConfig - the result of which should then be passed back to the element.
* accessibility


## Giving processing more control...


As an example if we ask processing to build a state object
based on an env change. Things like localization, customization of assets 
etc could happen here.

The client side logic would be simpler because it'd just need to handle, a simpler model.
No need to adjust on the fly.

What about session.. if it's updated in the client we don't want to have to do this.

Also latency.. 

processing.state = function(env, question, session){

  if(env.locale == 'en_US'){
    
  }
  return {};
}
