var is = {
	arr: function(value){
		return toString.call(value) === '[object Array]';
	},
	obj: function(value){
		return typeof value === "object" && !is.arr(value);
	},
	val: function(value){
		return ['boolean', 'number', 'string'].indexOf(typeof value) > -1;
	},
	str: function(value){
		return typeof value === "string";
	},
	num: function(value){
		return typeof value === "number";
	},
	bool: function(value){
		return typeof value === 'boolean';
	},
	fn: function(value){
		return typeof value === 'function';
	},
	sfn: function(value){
		return is.fn(value) && value.main;
	},
	def: function(value){
		return typeof value !== 'undefined';
	},
	undef: function(value){
		return typeof value === 'undefined';
	},
	simple: function(value){ // aka non-referential
		return (typeof value !== 'object' || value === null) && !is.fn(value); // null, NaN, or other non-referential values?

		// typeof null === "object"...
	},
	Class: function(value){
		return is.fn(value) && value.extend;
	},
	// better than "Class"
	Mod: function(value){
		return is.fn(value) && value.extend;
	},
	/// seems to work
	pojo: function(value){
		return is.obj(value) && value.constructor === Object;
	},
	mod: function(value){
		return is.obj(value) && is.Mod(value.constructor);
	},
	proto: function(value){
		return is.obj(value) && value.constructor && value.constructor.prototype === value;
	}
};

var assignProp = function(obj, name, value){
	if (is.fn(obj["set_"+name]))
		obj["set_"+name](value);
	else if (value && is.fn(value.assignTo)){
		value.assignTo(obj, name);
	} else {
		obj[name] = value;
	}
};

var assign = module.exports = function(name, value){
	if (is.str(name)){
		assignProp(this, name, value);
	} else {
		for (var i = 0; i < arguments.length; i++){
			var arg = arguments[i];
			for (var j in arg){
				assignProp(this, j, arg[j]);
			}
		}
	}
	return this;
};

var createConstructor = function(name){
	eval("var " + name + ";");
	var constructor = eval("(" + name + " = function " + name + "(){\r\n\
	if (!(this instanceof " + name + "))\r\n\
		return new (" + name + ".bind.apply(" + name + ", [null].concat([].slice.call(arguments)) ));\r\n\
	this.instantiate.apply(this, arguments);\r\n\
});");
	return constructor;
};

var extend = function(o){
	var name, Ext;

	name = (o && o.name) || (this.name + "Ext");
	if (o && o.name)
		delete o.name; // otherwise it gets assigned to prototype...
	
	Ext = this.createConstructor(name);

	Ext.assign = this.assign;

	// Constructor.props
	Ext.assign(this);
		Ext.base = this;

	// Setup inheritance
	Ext.prototype = Object.create(this.prototype);
		Ext.prototype.constructor = Ext;
		Ext.prototype.name = Ext.name[0].toLowerCase() + Ext.name.substring(1);

	// Use .assign to add/override prototype properties
	Ext.prototype.assign.apply(Ext.prototype, arguments);

	return Ext;
};

var Base = createConstructor("Base");

Base.assign = Base.prototype.assign = assign;

Base.assign({
	extend: extend,
	createConstructor: createConstructor
});

Base.prototype.assign({
	instantiate: function(){}
});

var Q = Base.extend({
	name: "Q",
	cbs: [],
	instantiate: function(){
		this.cbs = [];
		this.assign.apply(this, arguments);
		this.initialize.apply(this, arguments);
	},
	initialize: function(){},
	exec: function(){
		for (var i = 0; i < this.cbs.length; i++){
			this.cbs[i].apply(this.ctx || this.parent || this, arguments);
		}
		return this.ctx || this.parent || this;
	},
	then: function(cb){
		this.cbs.push(cb);
	}
});

/* only resolves one way */
Q.PromiseLike = Q.extend({
	name: "PromiseLike",

});

Q.Promise = Q.extend({
	name: "Promise",
	instantiate: function(){
		this.cbs = [];
		this.ebs = [];
		this.assign.apply(this, arguments);
		this.initialize.apply(this, arguments);
	},
	initialize: function(){
		if (this.parent){
			this.cbs.push(this.cb);//?
		}
	},
	errExec: function(){
		for (var i = 0; i < this.ebs.length; i++){
			this.ebs[i].apply(this.ctx || this.parent || this, arguments);
		}
		return this.ctx || this.parent || this;
	},
	resolve: function(){
		if (!this.complete){
			this.complete = true;
			this.resolved = true;
			this.rejected = false;
			this.exec.apply(this, arguments);
		} else {
			console.warn("already resolved");
		}
	},
	reject: function(){
		if (!this.complete){
			this.complete = true;
			this.rejected = true;
			this.resolved = false;
			this.errExec.apply(this, arguments);
		}
	},
	then: function(cb, eb){
		return new this.constructor({
			parent: this,
			cb: cb,
			eb: eb
		});
	},
	and: function(q){
		var ret = new this.constructor();
		this.then(function(){
			q.then(function(){
				ret.resolve.apply(ret, arguments);
			});
		});
		return ret;
	},
	catch: function(cb){

	}
});