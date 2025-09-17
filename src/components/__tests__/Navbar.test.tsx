import { render, screen } from '@testing-library/react'
import { Navbar } from '../Navbar'

describe('Navbar', () => {
  it('renders a link to the admin page', () => {
    render(<Navbar />)

    const adminLink = screen.getByRole('link', { name: /admin/i })

    expect(adminLink).toBeInTheDocument()
  })
})
