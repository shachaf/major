majordict.json majordict.txt: gen.js cmudict-0.7b
	node gen.js

serve: index.html index.js majordict.json react.production.min.js react-dom.production.min.js
	python -mSimpleHTTPServer
