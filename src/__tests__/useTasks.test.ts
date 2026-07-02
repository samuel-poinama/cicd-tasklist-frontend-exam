import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');

const mockedApi = vi.mocked(taskApi);

const task1: Task = {
	id: 1,
	title: 'Task 1',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

const task2: Task = {
	id: 2,
	title: 'Task 2',
	description: 'desc',
	completed: true,
	createdAt: '2026-01-16T10:00:00Z',
	updatedAt: '2026-01-16T10:00:00Z',
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('useTasks', () => {
	it('loads tasks on mount', async () => {
		mockedApi.getTasks.mockResolvedValue([task1, task2]);

		const { result } = renderHook(() => useTasks());
		expect(result.current.loading).toBe(true);

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.tasks).toEqual([task1, task2]);
		expect(result.current.error).toBeNull();
	});

	it('sets error message when load fails', async () => {
		mockedApi.getTasks.mockRejectedValue(new Error('Network down'));

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe('Network down');
	});

	it('sets generic error when non-Error thrown', async () => {
		mockedApi.getTasks.mockRejectedValue('boom');

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe('Une erreur est survenue');
	});

	it('addTask prepends new task', async () => {
		mockedApi.getTasks.mockResolvedValue([task1]);
		mockedApi.createTask.mockResolvedValue(task2);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'Task 2' });
		});

		expect(result.current.tasks).toEqual([task2, task1]);
	});

	it('editTask replaces the updated task', async () => {
		mockedApi.getTasks.mockResolvedValue([task1, task2]);
		const updated = { ...task1, title: 'Updated' };
		mockedApi.updateTask.mockResolvedValue(updated);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Updated' });
		});

		expect(result.current.tasks[0].title).toBe('Updated');
	});

	it('removeTask deletes the task', async () => {
		mockedApi.getTasks.mockResolvedValue([task1, task2]);
		mockedApi.deleteTask.mockResolvedValue();

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks).toEqual([task2]);
	});

	it('toggleComplete flips completion state', async () => {
		mockedApi.getTasks.mockResolvedValue([task1]);
		mockedApi.updateTask.mockResolvedValue({ ...task1, completed: true });

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(mockedApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks[0].completed).toBe(true);
	});

	it('toggleComplete does nothing for unknown id', async () => {
		mockedApi.getTasks.mockResolvedValue([task1]);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(999);
		});

		expect(mockedApi.updateTask).not.toHaveBeenCalled();
	});

	it('loadTasks can be called manually to refresh', async () => {
		mockedApi.getTasks.mockResolvedValue([task1]);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		mockedApi.getTasks.mockResolvedValue([task1, task2]);
		await act(async () => {
			await result.current.loadTasks();
		});

		expect(result.current.tasks).toEqual([task1, task2]);
	});
});
