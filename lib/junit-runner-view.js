'use babel';

export default class JunitRunnerView
{
	constructor()
	{
		// Create root element
		this.element = document.createElement('div');
		this.element.classList.add('junit-runner');

		// Create message element
		const message = document.createElement('div');
		message.textContent = 'The JunitRunner package is Alive! It\'s ALIVE!';
		message.classList.add('message');
		this.element.appendChild(message);
	}

	// Tear down any state and detach
	destroy()
	{
		this.element.remove();
	}

	serialize()
	{
		// what
	}

	getElement()
	{
		return this.element;
	}
}
