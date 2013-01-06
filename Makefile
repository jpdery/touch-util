all: build build-compress

build:
	@wrup -r touch-util ./ > touch-util.js
	@echo "File written to 'touch-util.js'"

build-compress:
	@wrup -r touch-util ./ > touch-util.min.js --compress
	@echo "File written to 'touch-util.min.js'"