const EvEm = require('events');
module.exports = function(){
    var utils = new Object();
    utils.CallPool = function(){
        this.e = new EvEm();
        this.func_list = new Array();
        this.tot = 0;
        this.count = 0;
        this.callable = true;

        this.add = function(fn, args){
            this.func_list.push({'fn' : fn, 'args' : args});
            this.tot += 1;
        };
         
        this.finish = function(){
            this.count += 1;
            if(this.count == this.tot){
                this.e.emit('done', this.count);
            }
        };

        this.call = function(cb){
            if(this.callable){
                if(this.tot == 0){
                    cb(0);
                } else {
                    this.e.on('done', cb);
                    this.callable = false;
                    for(let i in this.func_list){
                        let fn = this.func_list[i].fn;
                        fn.apply(fn, this.func_list[i].args);
                    }
                }
            } else {
                throw 'A call pool can only be used once. Create a new one please.';
            }
        };
            
    };
    return utils;
};
