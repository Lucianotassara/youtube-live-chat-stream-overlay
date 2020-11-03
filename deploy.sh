#!/bin/sh
git add . && git commit -m "deploy" && git push origin master && git push heroku master 