require("../css/styles.less");

var docroot = require("docroot");

var Router = require("route42/v1");
var View = require("view42/v1");

var TabGroup = require("tab-group");
var TabGroup2 = require("tab-group/v2");

var RouteView = TabGroup2.extend({
	name: "RouteView",
	Panel: TabGroup2.prototype.Panel.extend({
		name: "RoutePanel",
		init_tab: function(){
			this.tab.panel = this;
			this.tab.click(function(){
				this.route.activate();
			}.bind(this));
		}
	}),
	render: function(){
		this.prepend("contents for" + this.route.path());
		this.route.each(function(route){
			route.panel = this.append_panel(route.part, route.render());
			route.panel.route = route;
		}.bind(this));
	}
});

var router = Router({
	part: "/",
	// log: true,
	set_Route: function(pojo){
		this.Route = this.Route.extend(pojo);
	},
	Route: {
		render: function(){
			return RouteView({
				route: this
			});
		},
		get_panel: function(){
			if (!this.panel){
				this.panel = this.Panel({
					tagGroup: this.router.panel,
					name: this.part,
					view: this.render(),
					tab: View(this.part).addClass("tab")
				})
			}
		},
		activate: function(push){
			if (!this.isActiveNode()){
				this.router.set_activeNode(this);
				if (push !== false)
					this.push();
				this.exec();
			} else {
				// console.warn("already active route");
			}
		},
		deactivatePanel: function(){
			console.log("deactivate", this.panel.name);
			this.panel.remove();
			this.parent.deactivatePanel();
		},
		activatePanel: function(){
			this.parent.activatePanel();
			this.panel.appendTo(this.panel.tabGroup);
			this.panel.activate();
		},
	},
	set_activeNode: function(route){
		this.activeNode && this.activeNode.deactivatePanel();

			console.log("??");
		this.activeNode = route;
		this.update_cbs = this.update_cbs || [];
		this.update_cbs.forEach(function(cb){
			cb.call(this);
		}.bind(this));

		this.activeNode.activatePanel();
	},
	activatePanel: function(){
		this.panel.appendTo(this.panel.tabGroup);
		this.panel.activate();
	},
	deactivatePanel: function(){
		this.panel.deactivate();
	},
	update: function(cb){
		this.update_cbs = this.update_cbs || [];
		this.update_cbs.push(cb);
	},
	render: function(){
		var router = this;
		this.view = RouteView({
			route: this,
			render: function(){
				var panel = this.append_panel("/", View("Home")).then(function(){
					this.route.activate();
				}.bind(this));

				panel.route = this.route;

				this.route.panel = panel;

				RouteView.prototype.render.apply(this, arguments);
			}
		});


		return this.view;
	}
});

var req = require.context("../", true, /\.tests\.js$/);

req.keys().forEach(function(key){
	// console.log(key);
	var path = key.replace(".tests.js", "");
	var route = router.add(path).then(function(){
		req(key);
	});
});


docroot.append({
	router: router.render()
});

router.matchAndActivate();