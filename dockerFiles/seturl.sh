#!/bin/bash

sleep 2m

grep -rnwl '/home/virgo' -e "VFB_EMBEDDER_URL" | xargs sed -i "s|VFB_EMBEDDER_URL|$VFB_EMBEDDER_URL|g"
