// objectparams are available under 'this.context.{yourVar}'
Mura.DisplayObject.blogmurajsvue = Mura.UI.extend({
  // Mura invokes this method by default

  render: function() {

    var self = this;
    var target =  "_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    this.container = Mura(this.context.targetEl);
    this.container.append("<div id='blogmurajsvue_content'></div>");

    this.target = Mura("#blogmurajsvue_content");
    this.target.append(this.template_base);

    this.main(); // Delegating to main()

    Mura.loader()
      .loadcss(
        '/modules/blogmurajsvue/assets/css/style.css')
      .loadjs(
        '/modules/blogmurajsvue/assets/js/vue.js',
      function() {
        self.loadVue();
       } ) ;
  }

  , main: function() {
  }

  , error: function(msg) {
    console.log( msg );
  }

  ,	getEndpoint: function() {
		return '/index.cfm/_api/json/v1/default/';
	}

  ,  getFeed: function( listener,entityname,sortBy,sortDir,filters) {
		var self = this;
		var entity = {};
		var data = {};
		var filterVal='';
    var itemsPer = 20;
		var feed = Mura
			.getFeed(entityname)
			.itemsPerPage(itemsPer);

		if(entityname=='entity'){
			feed.prop('scaffold').isEQ(1);
		}

		var hasFilterApplied=false;

		if(Mura("#results-filter").val().length) {
      feed.prop('name').contains(Mura("#results-filter").val());
    }

		if(sortBy) {
			feed.sort(sortBy,sortDir);
		}

     console.log('start');

		feed.getQuery()
			.then(
        function(collection) {
          console.log('collection');
          console.log(collection);

				data.collection = collection;
				data.list=collection.getAll().items;
				data.links=collection.getAll().links;

				collection.get('properties').then(
          function(response){
  					data.properties=response.properties.properties;
  					data.parentproperties=response.properties;

  					if(typeof data.parentproperties.dynamic=='undefined'){
  						data.parentproperties.dynamic=false;
  					} else if(typeof data.parentproperties.dynamic =='string'){
  						if(data.parentproperties.dynamic=='0' || data.parentproperties.dynamic.toLowerCase()=='false'){
  							data.parentproperties.dynamic=false;
  						} else {
  							data.parentproperties.dynamic=true;
  						}
  					}
  					data.hasFilterApplied=hasFilterApplied;
  					listener(data);

				  },
          function(response) {
            alert("Danger!")
          }
        );
		 },
     function(collection) {
      alert('Broken!');
     }
    );
	}

  , loadVue: function() {

    var self = this;

    var officeLocations = new Vue({
      el: '#officeLocations',
      data: {
        items: []
      },
      methods: {
        doLoad: function() {
          self.getFeed( this.setResults,"officelocation","name",Mura("#sort-dir").val() );
        },
        setResults: function( results ) {

          Mura("#office-list").show();
          this.items = results.list;
        }
      }
    });

    var exampleNav = new Vue({
      el: '#exampleNav',
      data: {
        currentView: 0,
        highlight_data: 0,
        highlight_vue: 0,
        highlight_promise: 0
      },
      methods: {
        setCurrentView: function( val ) {
          this.highlight_data=0;
          this.highlight_promise=0;
          this.highlight_vue=0;
          this.currentView = val;
        }
      }
    });
  }

  , template_base:
  `
  <div style="width: 30%;float: left">
    <div id="officeLocations">
      <input type="text" name="filter" id="results-filter">
      <button @click="doLoad">Show</button>
      <select id="sort-dir" @change="doLoad">
        <option value="asc">ASC</option>
        <option value="desc">DESC</option>
      </select>

      <ul id="office-list" style="list-style: none;display: none;">
        <li v-for="(item, index) in items">
          <div class="box">
          <h1>{{item.name}}</h1>
          <p>{{item.city}},{{item.state}}</p>
          <p>{{item.street}}</p>
          <h3>Hours of Operation</h3>
          <span v-html="item.hours"></span>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div style="width: 68%;float: right; padding: 0 0 0 10px">
    <div id="exampleNav">
      <ul class="nav nav-tabs" role="tablist" style="border-bottom: 0px">
        <li :class="{ btn: 1,'btn-secondary': currentView!==1, 'btn-success': currentView===1 }" @click="setCurrentView(1)">Markup</li>
        <li :class="{ btn: 1,'btn-secondary': currentView!==2, 'btn-success': currentView===2 }" @click="setCurrentView(2)">Vue.js</li>
        <li :class="{ btn: 1,'btn-secondary': currentView!==3, 'btn-success': currentView===3 }" @click="setCurrentView(3)">Mura JS</li>
      </ul>
      <p></p>
      <div v-show="currentView===1" style='border: 2px solid #fff;padding: 1px;border-radius: 10px;'>
  <pre style="font-size: 1.2em;background-color: #fff">
  &lt;div id="officeLocations">
  &nbsp;&nbsp;&nbsp;&lt;input type="text" name="filter" id="results-filter">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;button <strong :class="{vue: highlight_vue}">@click="doLoad"</strong>>Show&lt;/button>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;select id="sort-dir" <strong :class="{vue: highlight_vue}">@change="doLoad"</strong>>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;option value="asc">ASC&lt;/option>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;option value="desc">DESC&lt;/option>
  &nbsp;&nbsp;&nbsp;&lt;/select>

  &nbsp;&nbsp;&nbsp;&lt;ul id="office-list">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong :class="{vue: highlight_vue}">&lt;li v-for="(item, index) in items"></strong>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong :class="{data: highlight_data}">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;h1>{{item.name<span/>}}&lt;/h1>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;p>{{item.city<span/>}},{{item.state<span/>}}&lt;/p>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;p>{{item.street<span/>}}&lt;/p>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;h3>Hours of Operation&lt;/h3>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;span v-html="item.hours">&lt;/span>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;hr>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong :class="{vue: highlight_vue}">&lt;/li></strong>
  &nbsp;&nbsp;&nbsp;&lt;/ul>
  &lt;/div>

  </pre>
  <ul class="nav nav-tabs" role="tablist" style="border-bottom: 0px">
    <li :class="{ btn: 1,'btn-secondary': highlight_data!==1, 'btn-data': highlight_data===1 }" @click="highlight_data == 1 ? highlight_data=0 : highlight_data=1">Data</li>
    <li :class="{ btn: 1,'btn-secondary': highlight_vue!==1, 'btn-vue': highlight_vue===1 }" @click="highlight_vue == 1 ? highlight_vue=0 : highlight_vue=1">Bindings</li>
  </ul>
      </div>

      <div v-show="currentView===2" style='border: 2px solid #fff;padding: 1px;border-radius: 10px;'>
        <pre style="font-size: 1.2em;background-color: #fff">
  var officeLocations = new Vue({
  &nbsp;&nbsp;&nbsp;el: '#officeLocations',
  &nbsp;&nbsp;&nbsp;data: {
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;items: []\n
  &nbsp;&nbsp;&nbsp;},
  &nbsp;&nbsp;&nbsp;methods: {
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong :class="{data: highlight_data}">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;doLoad: function() {
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var sortDir = Mura("#sort-dir").val();

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WebinarExample
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.feed(this.setResults,"officelocation","name",sortDir);
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},
  &nbsp;&nbsp;&nbsp;</strong><strong :class="{vue: highlight_vue}">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;setResults: function( results ) {

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mura("#office-list").show();
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.items = results.list;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}
  &nbsp;&nbsp;&nbsp;</strong>
  &nbsp;&nbsp;&nbsp;}
  });
  </pre>
  <ul class="nav nav-tabs" role="tablist" style="border-bottom: 0px">
    <li :class="{ btn: 1,'btn-secondary': highlight_data!==1, 'btn-data': highlight_data===1 }" @click="highlight_data == 1 ? highlight_data=0 : highlight_data=1">Remote Call</li>
    <li :class="{ btn: 1,'btn-secondary': highlight_vue!==1, 'btn-vue': highlight_vue===1 }" @click="highlight_vue == 1 ? highlight_vue=0 : highlight_vue=1">Promise "Resolve"</li>
  </ul>

      </div>
      <div v-show="currentView===3" style='border: 2px solid #fff;padding: 1px;border-radius: 10px;'>
  <pre style="font-size: 1.2em;background-color: #fff">
  var WebinarExample = {

  &nbsp;&nbsp;&nbsp;feed: function( listener,entityname,sortBy,sortDir ) {
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var data = {};
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong :class="{data: highlight_data}">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var feed = Mura
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.getFeed(entityname)
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.itemsPerPage(20);
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong :class="{data: highlight_data}">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if(Mura("#results-filter").val().length)
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;feed.prop('name').contains(Mura("#results-filter").val());
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong :class="{data: highlight_data}">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if(sortBy)
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;feed.sort(sortBy,sortDir);
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong :class="{vue: highlight_vue}">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;feed.getQuery()
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.then(<strong :class="{promise: highlight_promise}">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// resolve aka 'success!'
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;function(collection) {
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;data.list=collection.getAll().items;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;listener(data);
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// reject aka 'failure!'
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;function(response) {
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alert("You done messed up, lad");
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}</strong>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;);</strong>
  &nbsp;&nbsp;&nbsp;}
  }
  </pre>
  <ul class="nav nav-tabs" role="tablist" style="border-bottom: 0px">
    <li :class="{ btn: 1,'btn-secondary': highlight_data!==1, 'btn-data': highlight_data===1 }" @click="highlight_data == 1 ? highlight_data=0 : highlight_data=1">Basics</li>
    <li :class="{ btn: 1,'btn-secondary': highlight_vue!==1, 'btn-vue': highlight_vue===1 }" @click="highlight_vue == 1 ? highlight_vue=0 : highlight_vue=1">Remote Request</li>
    <li :class="{ btn: 1,'btn-secondary': highlight_promise!==1, 'btn-promise': highlight_promise===1 }" @click="highlight_promise == 1 ? highlight_promise=0 : highlight_promise=1">Promise</li>
  </ul>

      </div>

    </div>

  </div>
  `

});
