# Himawari-Server

This is the server program that manages the rooms that are created for Himawari. If you're looking for the frontend written in JavaScript using React, look [here](https://github.com/ghorthalon/himawari-app).



## How to build

This repository uses the PeerJS server as a submodule. The idea was to fork and fix a few bugs that I have encountered. This has not happened yet, but it will in the future. Make sure to clone recursively.
```
git clone --recursive https://github.com/ghorthalon/himawari-server
npm install
```

If you've forgotten to clone recursively, no fear. Simply run
```
git submodule init --update
```
and all is well again. Don't forget the all too familiar npm install.

Also, you will need to download the dependencies for PeerJS-Server. Simply `cd` into it's directory, and run `npm install` there as well.

Next, you need to edit your configuration. An example configuration is provided in config/config.json.example. Simply copy it as config.json and edit the parameters to your hearts content, then `npm start` will spread your wings and take you aflight.

This is still very much a work in progress. I've hacked most of this together in a single weekend. Please forgive me as I do some clean up and do some really badly needed refactoring. I just wanted to take a break for a few days and didn't want to just have this project sit there. Maybe you want to help a little? ;)