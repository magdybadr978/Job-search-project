import { ErrorClass } from "../utils/errorClass.js";
import { asyncHandler } from "../utils/errorHandling.js";


export const isAuthorized = ( roles = [] ) => {
  return asyncHandler( async ( req, res, next ) => {
    if ( !roles.includes( req.authUser.role ) ) {
      return next( new ErrorClass( "not allow to you", 403) );
    }
    next();
  } );
};