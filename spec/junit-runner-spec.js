'use babel';

// import JunitRunner from '../lib/junit-runner';

xdescribe('JunitRunner', () =>
{
	let workspaceElement, activationPromise;

	beforeEach(() => { activationPromise = atom.packages.activatePackage('junit-runner'); });

	describe('when the junit-runner:run event is triggered', () =>
	{
		it('attempts to compile the Java file and run JUnit tests', () =>
		{
			atom.commands.dispatch(workspaceElement, 'junit-runner:run');

			waitsForPromise(() => { return activationPromise; });

			runs(() =>
			{
				expect(workspaceElement.querySelector('.junit-runner')).toExist();

				const junitRunnerElement = workspaceElement.querySelector('.junit-runner');
				expect(junitRunnerElement).toExist();

				const junitRunnerPanel = atom.workspace.panelForItem(junitRunnerElement);
				expect(junitRunnerPanel.isVisible()).toBe(true);
				atom.commands.dispatch(workspaceElement, 'junit-runner:run');
				expect(junitRunnerPanel.isVisible()).toBe(false);
			});
		});

		it('hides and shows the view', () =>
		{
			// This test shows you an integration test testing at the view level.

			// Attaching the workspaceElement to the DOM is required to allow the
			// `toBeVisible()` matchers to work. Anything testing visibility or focus
			// requires that the workspaceElement is on the DOM. Tests that attach the
			// workspaceElement to the DOM are generally slower than those off DOM.
			jasmine.attachToDOM(workspaceElement);

			expect(workspaceElement.querySelector('.junit-runner')).not.toExist();

			// This is an activation event, triggering it causes the package to be
			// activated.
			atom.commands.dispatch(workspaceElement, 'junit-runner:run');

			waitsForPromise(() => { return activationPromise; });

			runs(() =>
			{
				// Now we can test for view visibility
				const junitRunnerElement = workspaceElement.querySelector('.junit-runner');
				expect(junitRunnerElement).toBeVisible();
				atom.commands.dispatch(workspaceElement, 'junit-runner:run');
				expect(junitRunnerElement).not.toBeVisible();
			});
		});
	});
});
