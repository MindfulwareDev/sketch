
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');
window.VueCodeMirror = require('vue-codemirror')

window.graphlib = require('graphlib');
window.dagre = require('dagre');
window.joint = require('jointjs');
// Bring in our Vue Material package
window.VueMaterial = require('vue-material');
window.Vue.use(window.VueMaterial);
window.Vue.use(window.VueCodeMirror);

Vue.material.registerTheme('default', {
    primary: 'blue',
    accent: {
        color:  'light-blue',
        textColor: 'white'
    },
    warn: 'red',
    background: 'white'
})

// Bring in our custom jointjs shapes
require('./shapes/init.js');

// Bring in our components
Vue.component('diagram-view', require('./components/diagram-view.vue'));
Vue.component('element-browser', require('./components/element-browser.vue'));
Vue.component('load-browser', require('./components/load-browser.vue'));

/**
 * Initialize our Sketch app
 */
const sketch = new Vue({
    el: '#sketch',

    data: {
        graphHeight: 0,
        graphWidth: 0,
        statusText: '',
        // Represents the active element that has been clicked
        activeElement: null,
        inspectorTitle: '',
        inspectorFormConfig: null,
        inspectorTitleEditing: false,
        inspectorTempTitle: 'test',
        model: {
            '213aa8fb-15ec-44e7-9727-fd7273d9b109': {
                title: 'Start Event',
                name: 'Start from Webhook',
                type: 'events.Start',
                connections: [
                    'e4e51853-a604-4725-a75c-a1ae611a1ca7'
                ]
            },
            'e4e51853-a604-4725-a75c-a1ae611a1ca7': {
                title: 'Add Element',
                name: 'Add',
                type: 'util.Add',
                connections: []
            }
        }
    },
    methods: {
        guid() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
        },
        // Used when wanting to load an existing process
        load: function() {
            this.$refs['load-browser'].open();

        },
        loadSelect: function(data) {
            this.model = data;

        },
        browserSelect: function(data) {
            // what we do now is replace the activeElement with a new element
            let guid = this.guid();
            let el = {
                title: data.title,
                name: data.title,
                type: data.type,
                icon: data.icon,
                connections: [],
                formConfig: data.formConfig
            }
            this.$set(this.model, guid, el);
            // Now make all items that previously connected to the activeElement now connect to this element
            for(itemId in this.model) {
                let item = this.model[itemId];
                let idx = item.connections.indexOf(this.activeElement);
                if(idx > -1) {
                    item.connections.splice(idx, 1);
                    item.connections.push(guid);
                }
            };
            // Remove activeElement
            this.$delete(this.model, this.activeElement);
            // Now determine if the new element is a termination, if not, add an Add
            if(!data.termination) {
                let addGuid = this.guid();
                let add = {
                    label: 'Add',
                    type: 'util.Add',
                    connections: []
                }
                this.$set(this.model, addGuid, add);
                el.connections.push(addGuid);
            }
            this.activeElement = null
        },
        handleElementClick: function(id) {
            element = this.model[id];
            this.activeElement = id;
            if(element.type == 'util.Add') {
                this.$refs['element-browser'].open();

            } else {
                this.inspectorTitle = element.label ? element.label : element.title;
                this.inspectorFormConfig = element.formConfig;
                this.showInspector();
            }
        },
        showInspector() {
            this.$refs.inspector.toggle();
        },
        closeInspector() {
            this.activeElement = null;
            this.$refs.inspector.close();
        }
    },
    mounted() {
        let toolbar = $('#toolbar-container');
        this.graphHeight = $(window).height() - toolbar.height();
        this.graphWidth = $(window).width();
        $(window).on('resize', (e) => {
            this.graphHeight = $(window).outerHeight() - toolbar.outerHeight();
            this.graphWidth = $(window).outerWidth();
        });
    }
});


