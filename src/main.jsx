import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-tailwind/react';
import { MaterialTailwindControllerProvider } from '@/context';
import '../public/css/tailwind.css';
import { Toaster } from 'react-hot-toast';
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the grid
import 'react-datepicker/dist/react-datepicker.css'; // CSS for react date picker
import 'ckeditor5/ckeditor5.css'; //CSS for CKeditor

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <MaterialTailwindControllerProvider>
                    <App />
                    <Toaster />
                </MaterialTailwindControllerProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
