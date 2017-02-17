'use babel';

import JunitRunnerView from './junit-runner-view';
import {BufferedProcess, CompositeDisposable} from 'atom';
import path from 'path';
import process from 'process';

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
	originalClasspath: '',

	activate(state)
	{
		this.junitRunnerView = new JunitRunnerView(state.junitRunnerViewState);

		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source java"]', {'junit-runner:run': () => this.run()}));
		this.subscriptions.add(atom.config.onDidChange('junit-runner.classpath', {}, ({newValue}) => { this.setClasspath(newValue); }));

		this.originalClasspath = process.env.CLASSPATH || '';
		this.setClasspath(atom.config.get('junit-runner.classpath'));
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

	setClasspath(newValue)
	{
		process.env.CLASSPATH = this.originalClasspath + path.delimiter + newValue;
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

		const command = atom.config.get('junit-runner.javacExecutable');
		const args = [atom.config.get('junit-runner.javacArgs'), `${this.fileName}`];
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
		const command = atom.config.get('junit-runner.javaExecutable');
		const args = [atom.config.get('junit-runner.javaArgs'), `org.junit.runner.JUnitCore ${this.baseName}`];
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
				detail: this.output || this.stack,
				dismissable: true
			});
			return;
		}
		atom.notifications.addSuccess('Tests passed');
	}
};
