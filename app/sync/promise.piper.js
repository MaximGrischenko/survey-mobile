class PromisePiperElement {
    constructor( promiseHandler ) {
        this.promiseHandler = promiseHandler;
        this.promise = false;
        this.resolve = (res) => {};
        this.reject = (err) => {};
    }
}

export default class PromisePiper {
    constructor( context ) {
        this.context = null;
        this.onEveryResolveHandler = f=>f;
        this.resolve = ( res ) => {};
        this.reject = ( err ) => {};
        this.results = [];
        this.resolved = [];
        this.promisesStack = [];
        if ( context ) {
            this.setContext( context );
        }
    }
    onEveryResolve( handler ){
        this.onEveryResolveHandler = handler;
    }
    setContext( context ) {
        this.context = context;
    }
    pipe( promiseHandler ) {
        this.promisesStack.push( new PromisePiperElement( promiseHandler ) );
        return this;
    }
    then( reolveForLast, rejectForLast ) {
        this.promisesStack[ this.promisesStack.length - 1 ].resolve = reolveForLast;
        this.promisesStack[ this.promisesStack.length - 1 ].reject = rejectForLast;
        return this;
    }
    finally( resolveForFinal, rejectForFinal ) {
        this.resolve = resolveForFinal;
        this.reject = rejectForFinal;
        this.tryNext();
    }
    tryNext() {
        let nextPromiseElement = null;
        let isFinal = null;
        if ( this.promisesStack.length > 1 ) {
            nextPromiseElement = this.promisesStack.shift();
        } else if ( this.promisesStack.length === 1 ) {
            isFinal = true;
            nextPromiseElement = this.promisesStack.shift();
        } else {
            return false;
        }
        let promiseHandler = this.context ? nextPromiseElement.promiseHandler.bind( this.context ) : nextPromiseElement.promiseHandler;
        nextPromiseElement.promise = new Promise( promiseHandler ).then( ( result ) => {
            this.results.push( result );
            if ( isFinal ) {
                this.onEveryResolveHandler( result );
                this.resolve( this.results );
            } else {
                if ( nextPromiseElement.resolve ) {
                    this.onEveryResolveHandler( result );
                    nextPromiseElement.resolve( result );
                }
                this.tryNext();
            }
            this.resolved.push( nextPromiseElement );
        }, ( err ) => {
            if ( nextPromiseElement.reject ) {
                nextPromiseElement.reject( err );
            }
            this.reject( err );
        } );
    }
}