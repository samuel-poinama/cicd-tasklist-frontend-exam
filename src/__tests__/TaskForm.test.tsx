import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders in create mode by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
	});

	it('shows validation error when submitting empty title', async () => {
		const user = userEvent.setup({ delay: null });
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('clears validation error when typing', async () => {
		const user = userEvent.setup({ delay: null });
		render(<TaskForm onSubmit={vi.fn()} />);

		await user.click(screen.getByRole('button', { name: 'Ajouter' }));
		expect(screen.getByRole('alert')).toBeInTheDocument();

		await user.type(screen.getByLabelText('Titre'), 'A');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('submits trimmed title and description then resets in create mode', async () => {
		const user = userEvent.setup({ delay: null });
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		const titleInput = screen.getByLabelText('Titre');
		const descInput = screen.getByLabelText('Description');
		await user.type(titleInput, '  My task  ');
		await user.type(descInput, '  My desc  ');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'My task', description: 'My desc' });
		expect(titleInput).toHaveValue('');
		expect(descInput).toHaveValue('');
	});

	it('submits with undefined description when empty', async () => {
		const user = userEvent.setup({ delay: null });
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), 'Only title');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Only title', description: undefined });
	});

	it('renders edit mode with initial values and does not reset', async () => {
		const user = userEvent.setup({ delay: null });
		const onSubmit = vi.fn();
		render(
			<TaskForm
				onSubmit={onSubmit}
				mode="edit"
				initialValues={{ title: 'Existing', description: 'Desc' }}
			/>
		);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		const titleInput = screen.getByLabelText('Titre');
		expect(titleInput).toHaveValue('Existing');

		await user.click(screen.getByRole('button', { name: 'Modifier' }));
		expect(onSubmit).toHaveBeenCalledWith({ title: 'Existing', description: 'Desc' });
		expect(titleInput).toHaveValue('Existing');
	});

	it('renders cancel button and calls onCancel', async () => {
		const user = userEvent.setup({ delay: null });
		const onCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

		await user.click(screen.getByRole('button', { name: 'Annuler' }));
		expect(onCancel).toHaveBeenCalled();
	});
});
