cp vfb.xmi vfb.bak
mv vfb-dev.xmi vfb.xmi
if [[ "$(python --version)" =~ "3." ]]; then
	python -m http.server 8989
else
	python -m SimpleHTTPServer 8989
fi
echo "test test"
mv vfb.xmi vfb-dev.xmi
mv vfb.bak vfb.xmi
