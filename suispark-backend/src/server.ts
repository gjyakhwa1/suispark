import { App } from './app.js';
import { AgentRoute } from './routes/agent.route.js';
import { UserRoute } from './routes/user.route.js';

const app = new App([new AgentRoute(), new UserRoute()]);

app.listen();
