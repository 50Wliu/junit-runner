'use babel';

import JunitRunnerView from './junit-runner-view';
import {CompositeDisposable} from 'atom';

export default
{
	junitRunnerView: null,
	modalPanel: null,
	subscriptions: null,

	activate(state)
	{
		this.junitRunnerView = new JunitRunnerView(state.junitRunnerViewState);
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.junitRunnerView.getElement(),
			visible: false
		});

		// Events subscribed to in Atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable();

		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add('atom-workspace', {'junit-runner:run': () => this.run()}));
	},

	deactivate()
	{
		this.modalPanel.destroy();
		this.subscriptions.dispose();
		this.junitRunnerView.destroy();
	},

	serialize()
	{
		return {junitRunnerViewState: this.junitRunnerView.serialize()};
	},

	run()
	{
		return this.modalPanel.isVisible() ? this.modalPanel.hide() : this.modalPanel.show();
	}
};
