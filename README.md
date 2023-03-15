# xkite ![version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![license](https://img.shields.io/badge/license-MIT-blue.svg) <a href="https://xkite.io/"><img src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social" /></a>

A Graphical User Interface (GUI) for Kafka Integrated Testing Environment (KITE)

The xkite GUI supports comprehensive prototyping, testing, and monitoring toolset built for Apache Kafka. It is built upon xkite-core library which provides the underpinning functionality for configuring a YAML file, managing docker containers (configure, run, pause, and shutdown), interfacing with remote xkite servers, and providing configuration settings for users to easily connect to their Kafka instances for development purposes. Use xkite to bootstrap your next project, or install our library into an existing project. Built by (and for) developers.

# Dependencies

- Latest stable versions of Node.js and NPM installed
- Latest stable version of <a href="https://docs.docker.com/compose/install/">docker-compose</a> installed.
- Clone repository: <code>git clone https://github.com/oslabs-beta/xkite.git</code>
- Install dependencies: Run <code>npm install</code> inside the project folder

# Quick Start

To install the <code>xkite</code> GUI run the following command:

```sh
  $ npx create-xkite <directory-name>
```

After the installation is complete, you can start the server by following the steps below:

1. ```sh
   $ cd <directory-name>
   ```
2. ```sh
   $ npm run dev
   ```

A browser window will open on http://localhost:3000 where you'll see the live preview.

Note: If the port 3000 is not available the server will start on the closest available port after 3000.
