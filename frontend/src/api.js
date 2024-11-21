import axios from 'axios';
import { API_BASE_URL } from '../config/api';  // Adjust path based on file structure

const api = axios.create({
    baseURL: API_BASE_URL,  // Use environment variable
});

export default api;