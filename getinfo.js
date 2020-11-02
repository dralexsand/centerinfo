(function () {

    let socket_port = "ws://127.0.0.1:8085";
    let socket = new WebSocket(socket_port);
    let base_url;
    let isLocal = 1;

    /* onLoad */

    function buildMethod(data) {

        let com;

        if (data.command === '') {
            com = data.action;
        } else if (data.attribute === '') {
            com = 'document.' + data.command + '("' + data.args + '").' + data.action + ';';
        } else {
            com = 'document.' + data.command + '("' + data.args + '")' + '.getAttribute("' + data.attribute + '");';
        }
        return com;
    }

    function builderMethodsParsing(config, event) {
        let evetsP = config.events;

        // ToDo switch case

        let listP = evetsP[0][event];

        let dataInfo = [];
        let itemDataInfo = {};

        for (key in listP) {
            itemDataInfo = {
                name: listP[key].name,
                value: eval(buildMethod(listP[key]))
            }
            dataInfo.push(itemDataInfo);
        }

        dataInfo.push(itemDataInfo);

        return dataInfo;
    }

    function getInfoOnLoad() {

        console.log("DOM is loaded");
        let base_url = getBaseUrl();

        let configParse = getConfigParseData(base_url, isLocal);

        let data_send = builderMethodsParsing(configParse, 'onLoad');

        let data_s = {
            'mode': 'onLoad',
            'user_info': '',
            'data': data_send,
        }

        sendingData(data_s, socket_port, base_url, isLocal);
    }

    /* onLoad end */

    /* onClick */

    function getInfoOnClicked(el) {

        console.log('getInfoOnClicked load');

        let tagname, classname, idname, class_list;

        tagname = el.tagName;
        //classname = el.hasAttribute('class') ? el.classList : '';
        classname = el.hasAttribute('class') ? el.className : '';
        idname = el.hasAttribute('id') ? el.getAttribute('id') : '';

        let el_info = {
            tagname,
            idname,
            classname
        };

        let list = getListClickable();
        let clicked_collection = [];
        let clicked_item = {};

        for (el of list) {

            if (el.id_method === 'id' && el.name === el_info.idname) {

                console.log('EL: ' + el.name);
                console.log('EL_INFO: ' + el_info.idname);

                clicked_item = {
                    'id_method': el.id_method,
                    'name': el.name
                }
                clicked_collection.push(clicked_item);
            }

            if (el.id_method === 'tag' && el.name === el_info.tagname) {
                clicked_item = {
                    'id_method': el.id_method,
                    'name': el.name
                }
                clicked_collection.push(clicked_item);
            }

            if (el.id_method === 'class') {

                class_list = el_info.classname.split();

                if (class_list.includes(el.name)) {
                    clicked_item = {
                        'id_method': el.id_method,
                        'name': el.name
                    }
                    clicked_collection.push(clicked_item);
                }
            }
        }

        if (clicked_collection.length > 0) {
            let data_s = {
                'mode': 'onClick',
                'user_info': '',
                'data': clicked_collection,
            }

            sendingData(data_s, socket_port, base_url, isLocal);
        }
    }

    /* onClick end */


    function getBaseUrl() {
        let current_url = window.location.href;

        let pathArray = current_url.split('/');
        let protocol = pathArray[0];
        var host = pathArray[2];
        let url = protocol + '//' + host;

        //console.log('BASE_URL: ' + url);
        return url;
    }

    function sendingData(data_send, socket_port, url_target_site, isLocal = 0) {

        console.log('DATA SEND');
        console.log(data_send);

        let connect_state = socket.readyState;
        console.log('CONNECT STATE: ' + connect_state);

        if (connect_state !== 1) {
            console.log(socket_port);
            socket = new WebSocket(socket_port);

            socket.onopen = function (e) {
                console.log("Open connection");
                console.log("Send data on sever");
                socket.send(JSON.stringify(data_send));
            };

            socket.onmessage = function (event) {
                ///console.log(`[onmessage] Data get from server: ${event.data}`);
            };
        } else {
            socket.onopen = function (e) {
                console.log("Connection is opened");
                console.log("Send data on opened sever");
                socket.send(JSON.stringify(data_send));
            };
        }
    }

    document.onclick = function (e) {
        getInfoOnClicked(e.target);
    }

    getInfoOnLoad();

    window.onscroll = (event) => {
        processScroll(event);
    };

    /*document.getElementsByTagName("body")[0].addEventListener("click", getInfoOnClicked);*/

    function processScroll(e) {

        console.log('SCROLL INFO');
        console.log(e);

        // ToDo get target from config
        let scroll_article = document.body.querySelector('section.news-content div.row div.col-lg-8.col-md-8 div.content');

        let scroll_info = {
            width: scroll_article.clientWidth,
            height: scroll_article.clientHeight,
            top: scroll_article.clientTop,
            offsetTop: scroll_article.offsetTop,
        };

        let base_url = getBaseUrl();

        let data_s = {
            'mode': 'onScroll',
            'user_info': '',
            'data': e,
        }

        sendingData(data_s, socket_port, base_url, isLocal);
    }
})();


function processScroll0() {

    let socket_port = "ws://127.0.0.1:8085";
    let socket = new WebSocket(socket_port);

    datauserinfo = this.getConfigParseData('http://sm.loc', 1);

    let connect_state = socket.readyState;
    console.log('CONNECT STATE: ' + connect_state);

    if (connect_state !== 1) {
        socket = new WebSocket(socket_port);

        socket.onopen = function (e) {
            console.log("Open connection");
            console.log("Send data on sever");
            socket.send(JSON.stringify(datauserinfo));
        };

        socket.onmessage = function (event) {
            // document.getElementById('message').innerHTML = "SERVER ANSWER: " + event.data;
            console.log(`[onmessage] Data get from server: ${event.data}`);
        };
    } else {
        socket.onopen = function (e) {
            console.log("Connection is opened");
            console.log("Send data on opened sever");
            socket.send(JSON.stringify(getConfigParseData('http://sm.loc', 1)));
        };
    }
}

function getConfigParseData(url, isLocal = 0) {

    let config = [
        {
            "local_url": "http://sm.loc",
            "remote_url": "https://go.sm.news",
            "events": [
                {
                    "onLoad": [
                        {
                            "name": "article_url",
                            "command": "",
                            "args": "",
                            "add_args": "",
                            "attribute": "",
                            "action": "window.location.href",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_title",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content h1",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerText",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_cover",
                            "command": "querySelector",
                            "args": "html body main#app-content.main div.container-md section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content div.news__image_box div.news__image figure picture source",
                            "add_args": "[0]",
                            "attribute": "srcset",
                            "action": "innerText",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_announcement",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.bottom__content div.news__preview",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_tags",
                            "command": "querySelector",
                            "args": ".keywords",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerText.replace('Теги:', '').split(' ').join();",
                            "callback": "clearTags()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_symbols_amount",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerText.length;",
                            "callback": "getArticlesSymbols()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_images_amount",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "getElementsByTagName('img').length;",
                            "callback": "getArticlesImages()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_published",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content time.date",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerText",
                            "callback": "getCorrectPublished()",
                            "callback_args": ""
                        }
                    ],
                    "onScroll": [
                        {
                            "name": "article_read_time",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "",
                            "attribute": "",
                            "action": "",
                            "callback": "getInfoOnScroll",
                            "callback_args": ""
                        }
                    ],
                    "onClick": [
                        {
                            "name": "article_clicked",
                            "command": "querySelector",
                            "args": "body",
                            "add_args": "",
                            "attribute": "",
                            "action": "",
                            "callback": "getInfoOnClicked",
                            "callback_args": ""
                        }
                    ]
                }
            ]
        },
        {
            "local_url": "http://moscow.loc",
            "remote_url": "https://moscow.sm-news.ru",
            "events": [
                {
                    "onLoad": [
                        {
                            "name": "article_url",
                            "command": "",
                            "args": "",
                            "add_args": "",
                            "attribute": "",
                            "action": "window.location.href",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_title",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content h1",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerText",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_cover",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content div.news__image_box div.news__image figure picture source",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_announcement",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.bottom__content div.news__preview",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_tags",
                            "command": "querySelector",
                            "args": ".keywords",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "clearTags()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_symbols_amount",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerText",
                            "callback": "getArticlesSymbols()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_images_amount",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "getArticlesImages()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_published",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content time.date",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "getCorrectPublished()",
                            "callback_args": ""
                        }
                    ],
                    "onScroll": [
                        {
                            "name": "article_read_time",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "",
                            "attribute": "",
                            "action": "",
                            "callback": "getInfoOnScroll",
                            "callback_args": ""
                        }
                    ],
                    "onClick": [
                        {
                            "name": "article_clicked",
                            "command": "querySelector",
                            "args": "body",
                            "add_args": "",
                            "attribute": "",
                            "action": "",
                            "callback": "getInfoOnClicked",
                            "callback_args": ""
                        }
                    ]
                }
            ]
        },
        {
            "local_url": "http://noteru.loc",
            "remote_url": "https://news.noteru.com",
            "events": [
                {
                    "onLoad": [
                        {
                            "name": "article_url",
                            "command": "",
                            "args": "",
                            "add_args": "",
                            "attribute": "",
                            "action": "window.location.href",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_title",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content h1",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerText",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_cover",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content div.news__image_box div.news__image figure picture source",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_announcement",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.bottom__content div.news__preview",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "",
                            "callback_args": ""
                        },
                        {
                            "name": "article_tags",
                            "command": "querySelector",
                            "args": ".keywords",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "clearTags()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_symbols_amount",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerText",
                            "callback": "getArticlesSymbols()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_images_amount",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "getArticlesImages()",
                            "callback_args": ""
                        },
                        {
                            "name": "article_published",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content div.top__content time.date",
                            "add_args": "[0]",
                            "attribute": "",
                            "action": "innerHTML",
                            "callback": "getCorrectPublished()",
                            "callback_args": ""
                        }
                    ],
                    "onScroll": [
                        {
                            "name": "article_read_time",
                            "command": "querySelector",
                            "args": "section.news-content div.row div.col-lg-8.col-md-8 div.content",
                            "add_args": "",
                            "attribute": "",
                            "action": "",
                            "callback": "getInfoOnScroll",
                            "callback_args": ""
                        }
                    ],
                    "onClick": [
                        {
                            "name": "article_clicked",
                            "command": "querySelector",
                            "args": "body",
                            "add_args": "",
                            "attribute": "",
                            "action": "",
                            "callback": "getInfoOnClicked",
                            "callback_args": ""
                        }
                    ]
                }
            ]
        },
    ]

    let url_index = isLocal === 0 ? 'remote_url' : 'local_url';

    let is = 0;
    let configArray = [];

    for (let el of config) {

        if (el[url_index] === url) {
            configArray = el;
            is = 1;
            break;
        }
    }

    return is === 1 ? configArray : [];
}

function getInfoOnScroll() {
    console.log('eventClicked is done');

    let configParse = getConfigParseData('http://sm.loc', 1);

    console.log('LOG getInfoOnScroll');
    console.log(getInfoOnScroll);

    //let top_article = document.body.querySelector('section.news-content div.row div.col-lg-8.col-md-8 div.content');

    //processScroll();
    // clientWidth/clientHeight


}

function getListClickable() {
    return [
        {
            'id_method': 'id',
            'name': 'app-content',
        },
        {
            'id_method': 'class',
            'name': 'nav',
        },
        {
            'id_method': 'tag',
            'name': 'img',
        },
    ];
}


window.addEventListener("unload", function () {
    console.log("DOM unloaded");
    //setDataLocalStorage('onload_info_loaded', 0);
})

/* localStorage actions */

function updateDataLocalStorage(key, data) {
    let store = localStorage.getItem(key) ?? [];
    store.push(data);
    localStorage.setItem(key, store);
}

function setDataLocalStorage(key, data) {
    localStorage.setItem(key, data);
}

function getDataLocalStorage(key) {
    return localStorage.getItem(key) ?? [];
}

/* localStorage actions end */



