import React, { useEffect, useState } from 'react';
import Charts from './chart';
import BarChart from './hCharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Trackers() {
    const [amount, setAmount] = useState(() => {
        const savedBalance = localStorage.getItem('balance');
        const savedExpenses = localStorage.getItem('expenses');
        return {
            balance: savedBalance !== null ? Number(savedBalance) : 5000,
            expenses: savedExpenses !== null ? Number(savedExpenses) : 0
        };
    });

    const [balanceModal, setBalanceModal] = useState(false);
    const [addBalance, setAddBalance] = useState('');
    const [expenseModal, setExpenseModal] = useState(false);
    const [expense, setExpense] = useState({ title: '', price: '', category: '', date: '' });
    const [expenseList, setExpenseList] = useState(() => {
        const storedList = localStorage.getItem('expenseList');
        return storedList ? JSON.parse(storedList) : [];
    });

    const [chartList, setChartList] = useState(() => {
        const storedChartList = localStorage.getItem('chartList');
        return storedChartList ? JSON.parse(storedChartList) : [];
    });

    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        localStorage.setItem('balance', amount.balance);
        localStorage.setItem('expenses', amount.expenses);
    }, [amount]);

    useEffect(() => {
        localStorage.setItem('expenseList', JSON.stringify(expenseList));
    }, [expenseList]);

    useEffect(() => {
        localStorage.setItem('chartList', JSON.stringify(chartList));
    }, [chartList]);

    const handleAddBalance = () => {
        setAmount({ ...amount, balance: amount.balance + Number(addBalance) });
        setAddBalance('');
        setBalanceModal(false);
    };

    const handleExpense = () => {
        const price = Number(expense.price);
        if (!price || price <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (price > amount.balance && editIndex === null) {
            alert('Insufficient balance. Please add more funds to proceed.');
            return;
        }
        if (!expense.title || !expense.category || !expense.date) {
            alert('Please fill in all fields.');
            return;
        }

        if (editIndex !== null) {
            const prevPrice = Number(expenseList[editIndex].price);
            const updatedList = [...expenseList];
            updatedList[editIndex] = expense;

            setExpenseList(updatedList);
            setAmount(prev => ({
                ...prev,
                balance: prev.balance + prevPrice - price,
                expenses: prev.expenses - prevPrice + price
            }));
        } else {
            setExpenseList(prev => [...prev, expense]);
            setAmount(prev => ({
                ...prev,
                balance: prev.balance - price,
                expenses: prev.expenses + price
            }));
        }

        setChartList(prev => {
            const index = prev.findIndex(item => item.category === expense.category);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    price: Number(updated[index].price) + Number(expense.price)
                };
                return updated;
            } else {
                return [...prev, { category: expense.category, price: expense.price }];
            }
        });

        setExpense({ title: '', price: '', category: '', date: '' });
        setEditIndex(null);
        setExpenseModal(false);
    };

    const handleDelete = index => {
        const removedExpense = expenseList[index];
        const updatedList = expenseList.filter((_, i) => i !== index);
        setExpenseList(updatedList);

        setAmount(prev => ({
            ...prev,
            balance: prev.balance + Number(removedExpense.price),
            expenses: prev.expenses - Number(removedExpense.price)
        }));

        setChartList(prev => {
            const index = prev.findIndex(item => item.category === removedExpense.category);
            if (index > -1) {
                const updated = [...prev];
                updated[index].price = Number(updated[index].price) - Number(removedExpense.price);
                return updated;
            }
            return prev;
        });
    };

    const handleEdit = index => {
        const selectedExpense = expenseList[index];
        setExpense({ ...selectedExpense });
        setEditIndex(index);
        setExpenseModal(true);
    };

    return (
        <div>
            <h1 style={{ color: 'white', marginLeft: '2rem' }}>Expense Tracker</h1>
            <div className='expenseTracker'>
                <div className='tracker'>
                    <h2 style={{ color: 'white' }}>
                        Wallet Balance: <span style={{ color: '#89E148' }}>₹ {amount.balance}</span>
                    </h2>
                    <button onClick={() => setBalanceModal(true)}>+ Add Income</button>
                </div>
                <div className='tracker'>
                    <h2 style={{ color: 'white' }}>
                        Expense: <span style={{ color: '#F4BB4A' }}>₹ {amount.expenses}</span>
                    </h2>
                    <button onClick={() => setExpenseModal(true)}>+ Add Expense</button>
                </div>
                <div className='charts'>
                    <Charts chartList={chartList} />
                </div>
            </div>

            {/* Manual Modal for Balance */}
            {balanceModal && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3>Add Balance</h3>
                        <input
                            type='number'
                            value={addBalance}
                            onChange={e => setAddBalance(e.target.value)}
                            placeholder='Income Amount'
                        />
                        <button onClick={handleAddBalance}>Add Balance</button>
                        <button onClick={() => setBalanceModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Manual Modal for Expense */}
            {expenseModal && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3>{editIndex !== null ? 'Edit Expense' : 'Add Expense'}</h3>
                        <input
                            name='title'
                            value={expense.title}
                            onChange={e => setExpense({ ...expense, title: e.target.value })}
                            placeholder='Title'
                        />
                        <input
                            name='price'
                            type='number'
                            value={expense.price}
                            onChange={e => setExpense({ ...expense, price: e.target.value })}
                            placeholder='Amount'
                        />
                        <select
                            name='category'
                            value={expense.category}
                            onChange={e => setExpense({ ...expense, category: e.target.value })}
                        >
                            <option value=''>Select Category</option>
                            <option value='Food'>Food</option>
                            <option value='Entertainment'>Entertainment</option>
                            <option value='Travel'>Travel</option>
                        </select>
                        <input
                            name='date'
                            type='date'
                            value={expense.date}
                            onChange={e => setExpense({ ...expense, date: e.target.value })}
                        />
                        <button onClick={handleExpense}>
                            {editIndex !== null ? 'Update' : 'Add'} Expense
                        </button>
                        <button onClick={() => setExpenseModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className='transactionsTab'>
                <h2 style={{ color: 'white' }}>Recent Transactions</h2>
                {expenseList.length === 0 ? (
                    <div>No Transactions</div>
                ) : (
                    expenseList.map((item, index) => (
                        <div key={index} className='transactionHistory'>
                            <div>
                                <div>{item.title}</div>
                                <div>{item.date}</div>
                            </div>
                            <div>
                                <span>₹ {item.price}</span>
                                <FontAwesomeIcon icon={faXmark} onClick={() => handleDelete(index)} />
                                <FontAwesomeIcon icon={faPen} onClick={() => handleEdit(index)} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className='topExpenses'>
                <h2>Top Expenses</h2>
                <div className='chartWrapper'>
                    {chartList.length > 0 && <BarChart chartList={chartList} />}
                </div>
            </div>
        </div>
    );
}
