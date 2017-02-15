'use babel';

import JunitRunnerView from './junit-runner-view';
import {BufferedProcess, CompositeDisposable} from 'atom';
import path from 'path';

export default
{
	junitRunnerView: null,
	subscriptions: null,
	cwd: null,
	filePath: null,
	baseName: null,
	fileName: null,
	output: '',
	stack: '',

	activate(state)
	{
		this.junitRunnerView = new JunitRunnerView(state.junitRunnerViewState);

		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(atom.commands.add('atom-text-editor', {'junit-runner:run': () => this.run()}));
	},

	deactivate()
	{
		this.subscriptions.dispose();
		this.junitRunnerView.destroy();
	},

	serialize()
	{
		return {junitRunnerViewState: this.junitRunnerView.serialize()};
	},

	setup()
	{
		const editor = atom.workspace.getActiveTextEditor();
		if(editor === null) return;
		this.filePath = editor.getPath();
		this.cwd = path.dirname(this.filePath);
		this.baseName = path.basename(this.filePath, path.extname(this.filePath));
		this.fileName = path.basename(this.filePath);
	},

	run()
	{
		this.setup();

		this.output = '';
		this.stack = '';

		const command = 'javac';
		const args = [`-cp .;../libs/* ${this.fileName}`];
		const options = {cwd: this.cwd, shell: true};
		const stdout = (data) => { this.output += data; };
		const stderr = (data) => { this.stack += data; };

		// Compile
		new BufferedProcess({command, args, options, stdout, stderr, exit: (code) => { this.runTests(code); }});
	},

	runTests(code)
	{
		if(code)
		{
			atom.notifications.addError('Compilation failed', {
				detail: `Compilation of ${this.filePath} failed`,
				dismissable: true,
				stack: this.stack
			});
			return;
		}

		this.output = '';
		this.stack = '';

		// Launch JUnit
		const command = 'java';
		const args = [`-cp .;../libs/* org.junit.runner.JUnitCore ${this.baseName}`];
		const options = {cwd: this.cwd, shell: true};
		const stdout = (data) => { this.output += data; };
		const stderr = (data) => { this.stack += data; };
		new BufferedProcess({command, args, options, stdout, stderr, exit: (exitCode) => { this.showResults(exitCode); }});
	},

	showResults(code)
	{
		if(code)
		{
			atom.notifications.addWarning('Tests failed', {
				detail: this.output,
				dismissable: true
			});
			return;
		}
		atom.notifications.addSuccess('Tests passed');
	}
};
