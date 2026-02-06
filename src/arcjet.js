import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

if (!arcjetKey) throw new Error('ARCJET_KEY environment variable is required');

export const httpArcjet = arcjetKey?
arcjet({
    key : arcjetKey,
    rules:[
        shield({mode:arcjetMode}),
        detectBot({mode:arcjetMode,allow:['CATEGORY:SEARCH_ENGINE','CATEGORY:PREVIEW']}),
        slidingWindow({
            mode: arcjetMode,
            interval: '10s',
        max:50,})
    ]


}):null
export const wsArcjet = arcjetKey?
arcjet({
        key : arcjetKey,
    rules:[
        shield({mode:arcjetMode}),
        detectBot({mode:arcjetMode,allow:['CATEGORY:SEARCH_ENGINE','CATEGORY:PREVIEW']}),
        slidingWindow({
            mode: arcjetMode,
            interval: '2s',
        max:5,})
    ]



}):null


export function securtiyMiddleware(req,res,next){
    return async (req,res,next)=>{
        if(!httpArcjet) return next();
       try {
        const result = await httpArcjet.protect(req);
      if(result.isDenied()) {
        return res.status(429).json({error:'Forbidden-too many requests '});
      }
      return res.status(403).json({error:'Forbidden-too many requests or suspected bot activity'});
       } catch (error) {
        console.error('Arcjet error:',error);
        return res.status(503).json({error:'Internal server error'});
        
       }
       next();
    }
}