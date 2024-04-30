/**
 * A timer-increment class that internally handles conditionals, counting, and resetting.
 * @param {any} resetTime in ms
 */

class Timer {
    constructor(resetTime) {
        this.resetTime = resetTime
        this.currentTime = resetTime
    }
    /**
     * Description
     * @returns {any}
     */
    tick() {
        this.currentTime -= deltaTime
        if (this.currentTime < 0) {
            this.currentTime = this.resetTime
            return true
        }
        return false
    }
}