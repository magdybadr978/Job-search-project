import { ErrorClass } from "./errorClass.js";


export const asyncHandler = ( fn ) => {
    return ( req, res, next ) => {
        return fn( req, res, next ).catch( async ( error ) => {
            return next( new ErrorClass( error, error.status ) );
        } )
    }
}

export const globalErrorHandling = ( error, req, res, next ) => {
    
    return res.status( error.status || 400 ).json( { success: false, message: error.message || error ,stack :error.stack} )
}