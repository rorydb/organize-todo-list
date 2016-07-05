// Namespace and object declarations
var org = org || {};

org.list_data == org.list_data || [];
org.lists = org.lists || {};
org.sidebar = org.sidebar || {};
org.content_height = org.content_height || {};


// Sample Data
org.list_data =
[
	{
		"id" : 1,
		"list_name" : "Errands",
		"todos" : [
			{"id" : 1, "text" : "Pay Bills", "complete" : true},
			{"id" : 2, "text" : "Refinance Mortgage", "complete" : false},
			{"id" : 3, "text" : "Mail Christmas Cards", "complete" : true},
			{"id" : 4, "text" : "Purchase 4k monitor", "complete" : false},
			{"id" : 5, "text" : "Invest in gold", "complete" : false},
			{"id" : 6, "text" : "Research Illuminati", "complete" : false},
		],
		"default" : false
	},

	{
		"id" : 2,
		"list_name" : "Listen To This",
		"todos" : [
			{"id" : 1, "text" : "She & Him", "complete" : false},
			{"id" : 2, "text" : "Michael Jordan's Touchdown Pass", "complete" : false},
			{"id" : 3, "text" : "Defiance, Ohio", "complete" : true},
			{"id" : 4, "text" : "Savoy Brown", "complete" : false},
			{"id" : 5, "text" : "Kurt Vile", "complete" : true},
			{"id" : 6, "text" : "Canned Heat", "complete" : false},
			{"id" : 7, "text" : "Halo Fauna", "complete" : false},
			{"id" : 8, "text" : "Captain Beefheart", "complete" : false},
			{"id" : 9, "text" : "XXYYXX", "complete" : false},
			{"id" : 10, "text" : "Gold Panda", "complete" : false},
		],
		"default" : true
	},

	{
		"id" : 3,
		"list_name" : "Groceries",
		"todos" : [
			{"id" : 1, "text" : "Milk", "complete" : true},
			{"id" : 2, "text" : "Eggs", "complete" : false},
			{"id" : 3, "text" : "Butter", "complete" : true},
			{"id" : 4, "text" : "Tofu", "complete" : false}
		],
		"default" : false
	}
];


// List Object
org.List = function(id,list_name) 
{
	this.id = id;
	this.list_name = list_name;
	this.todos = [];
	this.default = false;
};

// Todo Object
org.Todo = function(id,text)
{
	this.id = id;
	this.text = text;
	this.complete = false;
};

// Function Bodies
org.sidebar = 
{
	init: function()
	{
		theBurg = document.getElementById('hamburger');
		theBurg.addEventListener('click', org.sidebar.moveSidebar, false);
		org.sidebar.add_button();
		org.sidebar.switch_list();
	},

	moveSidebar: function() 
	{
		var list = document.getElementById('the-list');
		var move_these = document.querySelectorAll('#hamburger, #the-list, #sidebar');

		for (var i = 0; i < move_these.length; i++) {
			var elem = move_these[i];
			elem.classList.toggle('open');
		}
	},

	/** 
	 * Interactivity for add list button; creates a textbox or creates new list
	 */ 
	add_button: function() 
	{
		var btn = document.getElementById('add-new-list');

		btn.addEventListener('click', function(event) {
			event.preventDefault();

			// Button has not yet been pressed, create a textbox for a new list
			if (!btn.classList.contains('active')) {
				var naming_area = document.createElement('input');
				var parent = btn.parentNode;

				btn.classList.add('active');
				naming_area.type = "text";
				naming_area.id = "new-list-name";
				naming_area.placeholder = "Enter list name here";

				parent.insertBefore(naming_area, btn);
			} else {
				var naming_area = document.getElementById("new-list-name");

				// nothing has been entered
				if (naming_area.value.length === 0) {
					return;
				} else {
					org.list_functions.create_list(naming_area.value);
					naming_area.parentNode.removeChild(naming_area);
				}
			}
		}, false);
	},

	/**
	 * Switches the active list.
	 */
	switch_list: function() {
		var list_name_container = document.getElementById("sidebar");

		list_name_container.addEventListener("click", function(event) {
			event.preventDefault();

			if (event.target && event.target.matches("a")) {
				// There is a separate event for this
				if (event.target.id === "add-new-list") {
					return;
				// Active list selected, do nothing
				} else if (event.target.classList.contains("active")) {
					return;
				// User has selected a list to change to 
				} else {
					var list_id = parseInt(event.target.getAttribute('data-list-id'));

					// Giving ative status to selected list
					document.querySelector("#sidebar .switcher a.active").classList.remove('active');
					event.target.classList.add('active');

					// Removing old todos and adding new ones to markup
					org.list_functions.clear_content();
					setTimeout(function() {
						org.list_functions.populate_content(org.list_functions.retrieve_list(list_id));
					}, 500);					
				}
				
			}
		});
	}
};


org.content_height = 
{
	content: document.querySelectorAll('#the-list, #sidebar > nav'),
	footer: document.querySelector('footer'),
	new_height: '',

	init: function()
	{
		org.content_height.calculate_height();
		org.content_height.resize();
	},

	calculate_height: function() {
 		org.content_height.new_height = (window.innerHeight - org.content_height.footer.offsetHeight) + 'px';

		for (var i = 0; i < org.content_height.content.length; i++) {
			var elem = org.content_height.content[i];

			elem.style.height = org.content_height.new_height;
		}
	},

	resize: function() {
		window.addEventListener('resize', function(){
			org.content_height.calculate_height();
		}, false);
	}
};


org.list_functions = 
{
	active: document.getElementById('active'),
	completed: document.getElementById('complete'),

	init: function ()
	{
		org.list_functions.populate_sidebar();
		org.list_functions.default_list();
		org.list_functions.make_todo_from_text();
		org.list_functions.toggle_status();
	},

	/**
	 * Find default todo list and populates content on page load
	 */
	default_list: function()
	{
		var lists = org.list_data;
		var default_list = lists.filter(function(list) {
			return list["default"] === true;
		});

		org.list_functions.populate_content(default_list[0]);

		// Adding active attribute to respective sidebar entry
		document.querySelectorAll("#sidebar .switcher a")
	},


	/**
	 * Loads the name of a list and its ID into the sidebar
	 */
	add_list_to_sidebar: function(list_object) 
	{
		if (list_object === undefined) {
			return;
		} else {
			var list_of_lists = document.querySelector('#sidebar nav ul');
			var li_markup = document.createElement('li');
			var new_anchor = document.createElement('a');
			var list_name = document.createTextNode(list_object["list_name"]);

			// Adding attributes and list name to anchor
			new_anchor.href = "#";
			new_anchor.setAttribute('data-list-id', list_object["id"]);
			new_anchor.appendChild(list_name);

			if (list_object["default"] === true) {
				new_anchor.classList.add('active');
			}

			li_markup.classList.add("switcher");

			// Appending anchor to list item and appending list item to ul
			li_markup.appendChild(new_anchor);
			list_of_lists.insertBefore(li_markup, list_of_lists.childNodes[list_of_lists.childNodes.length-1]);		
		}
	},

	/**
	 * Adds all lists to the sidebar
	 */ 
	populate_sidebar: function() 
	{
		var lists = org.list_data;

		lists.forEach( function(list) {
			org.list_functions.add_list_to_sidebar(list);
		});
	},

	/**
	 * Loads todos of a selected list into the markup
	 */
	populate_content: function(list)
	{
		var todos = list["todos"];
		var id = list["id"];
		var todo_callback_counter = 0;
		var markup_list = document.getElementById("the-list");
		var list_title = document.getElementById("list-name");
		var list_name = document.createTextNode(list["list_name"]);

		markup_list.setAttribute("data-list-id", id);
		list_title.innerHTML = '';
		list_title.appendChild(list_name);

		if (todos.length === 0) {
			org.list_functions.update_count();
		} else {
			// Iterating over each todo and creating markup
			todos.forEach( function(todo) {
				var entry = document.createElement("div");
				var input = document.createElement("input");
				var label = document.createElement("label");
				var label_text = document.createTextNode(todo["text"]);

				entry.classList.add("list-entry");
				entry.setAttribute("data-todo-id", todo["id"]);

				input.type = "checkbox";
				input.name = "item-" + todo["id"];
				input.id = "item-" + todo["id"];

				label.setAttribute("for", "item-" + todo["id"]);
				label.appendChild(label_text);

				entry.appendChild(input);
				entry.appendChild(label);

				// Adding todo to respective section of list
				if (todo["complete"] === true) {
					input.setAttribute("checked", "checked");
					org.list_functions.completed.insertBefore(entry, org.list_functions.completed.childNodes[org.list_functions.completed.childNodes.length-2]);
				}
				else {
					org.list_functions.active.insertBefore(entry, org.list_functions.active.childNodes[org.list_functions.active.childNodes.length-2]);
				}

				todo_callback_counter++;

				if (todo_callback_counter === todos.length) {
					org.list_functions.update_count();
				}
			});
		}

	},

	/**
	 *	Clears all populated content
	 */
	 clear_content: function() 
	 {
	 	var todos = document.querySelectorAll('.list-entry');

	 	for (var i = 0; i < todos.length; i++) {
	 		var current = todos[i];
	 		current.style.opacity = 0;
	 	}

	 	setTimeout(function(){
	 		for (var j = 0; j < todos.length; j++) {
		 		var current = todos[j];
		 		current.parentNode.removeChild(current);			
	 		}
	 	}, 500);
	 },

	/**
	 * Creates a new list and adds it to the org.list_data array
	 */ 
	create_list : function(name) 
	{
		var new_id = org.list_data.length + 1;
		var new_list = new org.List(new_id, name);

		org.list_data.push(new_list);
		org.list_functions.add_list_to_sidebar(new_list);
	},

	/**
	 * Creates new todo and adds it to todo array inside of list / creates markup
	 */
	create_todo: function(text)
	{
		var current_list = parseInt(document.getElementById("the-list").getAttribute("data-list-id"));	

		// Updating in array
		for (var i in org.list_data) {
			if (parseInt(org.list_data[i]["id"]) === current_list) {
				var new_id = org.list_data[i]["todos"].length + 1;
				var new_todo = new org.Todo(new_id, text);
				
				org.list_data[i]["todos"].push(new_todo);
			}
		}

		// Updating in markup
		var entry = document.createElement("div");
		var input = document.createElement("input");
		var label = document.createElement("label");
		var label_text = document.createTextNode(new_todo["text"]);

		entry.classList.add("list-entry");
		entry.setAttribute("data-todo-id", new_todo["id"]);

		input.type = "checkbox";
		input.name = "item-" + new_todo["id"];
		input.id = "item-" + new_todo["id"];

		label.setAttribute("for", "item-" + new_todo["id"]);
		label.appendChild(label_text);

		entry.appendChild(input);
		entry.appendChild(label);

		org.list_functions.active.insertBefore(entry, org.list_functions.active.childNodes[org.list_functions.active.childNodes.length-2]);
		org.list_functions.update_count();
	},


	/**
	 * Obtains a list object from object array based on id
	 */ 
	retrieve_list: function(id) {
		var lists = org.list_data;
		var list = lists.filter(function(list) {
			return list["id"] === id;
		});

		return list[0];
	},

	/**
	 * Turns text from text field into a new todo in the list data
	 */ 
	make_todo_from_text: function() {
		var text_box = document.getElementById("new-entry");
		var entry_btn = document.getElementById("submit-new-entry");

		entry_btn.addEventListener("click", function(event) {
			event.preventDefault();

			if (text_box.value.length > 0) {
				org.list_functions.create_todo(text_box.value);
				text_box.value = '';
			} else {
				return;
			}
		});
	},


	/**
	 * Moves todos from active to completed sections, and vice versa. Updates them in org.list_data
	 */
	toggle_status: function() {
		document.getElementById("the-list").addEventListener("click", function(event) {

			if ( event.target && (event.target.matches("input") && event.target["type"] === "checkbox") ) {
				
				// Updating object status
				var list_id = parseInt(document.getElementById("the-list").getAttribute("data-list-id"));
				var todo_id = parseInt(event.target.parentNode.getAttribute("data-todo-id"));
				var todo_obj = org.list_data[list_id-1]["todos"][todo_id-1];

				todo_obj.complete = !todo_obj.complete;

				// Updating placement in markup
				var move_this = event.target.parentNode.cloneNode(true);

				if (todo_obj.complete) {
					var append_reference = document.getElementById("complete").lastElementChild;
				} else {
					var append_reference = document.getElementById("active").lastElementChild;
				}

				append_reference.parentNode.insertBefore(move_this, append_reference);

				event.target.parentNode.addEventListener("transitionend", function() { 
					this.remove();
					org.list_functions.update_count();
				});

				event.target.parentNode.style.opacity = 0;
			}
			else {
				return;
			}			
		});
	},

	/**
	 * Updates the number of completed and active to-dos
	 */
	update_count: function() {
		var active_count = document.querySelectorAll('#active .list-entry').length;
		var completed_count = document.querySelectorAll('#complete .list-entry').length;

		document.getElementById('num-completed').innerHTML = completed_count;
		document.getElementById('num-active').innerHTML= active_count;
	}
}





// Initializations
document.addEventListener('DOMContentLoaded' , function () {
	org.list_functions.init();
	org.sidebar.init();
	org.content_height.init();
});