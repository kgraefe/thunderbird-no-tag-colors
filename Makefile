no-tag-colors.xpi: $(wildcard *.js *.json) COPYING
	zip -r $@ $+

clean:
	rm -rfv *.xpi
