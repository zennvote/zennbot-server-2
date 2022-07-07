import { Transaction } from 'typeorm';

export const Transactional = () => Transaction();
