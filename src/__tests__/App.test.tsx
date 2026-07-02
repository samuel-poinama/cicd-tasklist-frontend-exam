import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');

const mockedApi = vi.mocked(taskApi);

const task1: Task = {
	id: 1,
	title: 'App task',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('App', () => {
	it('renders header and loads tasks', async () => {
		mockedApi.getTasks.mockResolvedValue([task1]);

		render(<App />);
		expect(screen.getByText('Mes Tâches')).toBeInTheDocument();

		await waitFor(() => expect(screen.getByText('App task')).toBeInTheDocument());
		expect(screen.getByText('Total')).toBeInTheDocument();
	});

	it('shows empty state when there are no tasks', async () => {
		mockedApi.getTasks.mockResolvedValue([]);

		render(<App />);
		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());
	});

	it('adds a task through the form', async () => {
		const user = userEvent.setup({ delay: null });
		mockedApi.getTasks.mockResolvedValue([]);
		mockedApi.createTask.mockResolvedValue(task1);

		render(<App />);
		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());

		await user.type(screen.getByLabelText('Titre'), 'App task');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		await waitFor(() => expect(screen.getByText('App task')).toBeInTheDocument());
		expect(mockedApi.createTask).toHaveBeenCalledWith({ title: 'App task', description: undefined });
	});
});
