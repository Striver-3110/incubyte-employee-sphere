
interface ProxyRequest {
  headers: {
    host: string;
  };
}

// Fallback configuration if the file doesn't exist
const defaultConfig = {
  webserver_port: 8000
};

let webserver_port: number;

try {
  const common_site_config = require('../../../sites/common_site_config.json');
  webserver_port = common_site_config.webserver_port;
} catch (error) {
  console.warn('Could not load common_site_config.json, using default port');
  webserver_port = defaultConfig.webserver_port;
}

export default {
	'^/(app|api|assets|files|private)': {
		target: `http://127.0.0.1:${webserver_port}`,
		ws: true,
		router: function(req: ProxyRequest) {
			const site_name = req.headers.host.split(':')[0];
			return `http://${site_name}:${webserver_port}`;
		}
	}
};
