import React from 'react';
import AddBookModal from './AddBookModal';

const Header = ({ onNavigate, onLogout, user }) => {
    const [isAddBookOpen, setIsAddBookOpen] = React.useState(false);

    const handleAddBook = (newBook) => {
        console.log("New book added:", newBook);
    };



    return (
        <header style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>Readily</h2>
            <nav style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
                {user ? (
                    <>
                        <button onClick={() => setIsAddBookOpen(true)}>Add Book</button>
                        <button onClick={() => onNavigate('profile')}>Profile</button>
                        <button onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <button onClick={onLogout}>Login</button>
                )}
            </nav>
            <AddBookModal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} onBookAdded={handleAddBook} />
        </header>

                    
    );
};

export default Header;
