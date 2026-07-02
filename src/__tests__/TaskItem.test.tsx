import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const task: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Ma description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders task title, description and date', () => {
		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Ma description')).toBeInTheDocument();
	});

	it('does not render description when absent', () => {
		render(
			<TaskItem
				task={{ ...task, description: null }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.queryByText('Ma description')).not.toBeInTheDocument();
	});

	it('applies completed class when task is completed', () => {
		render(
			<TaskItem
				task={{ ...task, completed: true }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
	});

	it('calls onToggle when checkbox clicked', async () => {
		const user = userEvent.setup({ delay: null });
		const onToggle = vi.fn();
		render(<TaskItem task={task} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);

		await user.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('enters edit mode and saves changes', async () => {
		const user = userEvent.setup({ delay: null });
		const onEdit = vi.fn();
		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

		await user.click(screen.getByRole('button', { name: 'Modifier' }));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Nouveau titre');
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Nouveau titre',
			description: 'Ma description',
		});
		expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
	});

	it('does not save with empty title', async () => {
		const user = userEvent.setup({ delay: null });
		const onEdit = vi.fn();
		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

		await user.click(screen.getByRole('button', { name: 'Modifier' }));
		await user.clear(screen.getByLabelText('Modifier le titre'));
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).not.toHaveBeenCalled();
	});
});

describe('TaskItem delete confirmation', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('requires confirmation before deleting', () => {
		const onDelete = vi.fn();
		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);

		const deleteBtn = screen.getByRole('button', { name: 'Supprimer' });
		fireEvent.click(deleteBtn);
		expect(onDelete).not.toHaveBeenCalled();
		expect(deleteBtn).toHaveTextContent('⚠️');

		fireEvent.click(deleteBtn);
		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('resets confirmation after timeout', () => {
		const onDelete = vi.fn();
		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);

		const deleteBtn = screen.getByRole('button', { name: 'Supprimer' });
		fireEvent.click(deleteBtn);
		expect(deleteBtn).toHaveTextContent('⚠️');

		act(() => {
			vi.advanceTimersByTime(3000);
		});
		expect(deleteBtn).toHaveTextContent('🗑️');
	});
});
