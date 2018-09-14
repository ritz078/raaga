declare module "*.json" {
	const value: any;
	export default value;
}

declare module "@workers/midiload.worker" {
	class WebpackWorker extends Worker {
		constructor();
	}

	export default WebpackWorker;
}

declare module "@workers/canvas.worker" {
	class WebpackWorker extends Worker {
		constructor();
	}

	export default WebpackWorker;
}
