import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';  

export const verifyAdmin = (req, res, next) => {
    try {
        if(!req.user) {
            return res.status(401).json({message:'Authentication required!'});
        }

        if(req.user.role !== 'admin') {
            return res.status(403).json({message: 'Acces denied! Admin only.'})
        }

        next();
    } catch (error) {
        console.error('Verify admin error: ', error)
        res.status(403).json({
            message : 'Access denied',
            error : error.message
        })
    }
}