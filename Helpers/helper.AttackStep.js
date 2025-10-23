//Individual step in an attack chain
class AttackStep {
    /**
     * 
     * @param {Object} options
     * @param {string} options.tool
     * @param {Object} [options.parameters={}] //[] are used such that i will be able to give a default value if not passed in object 
     * @param {string} [options.expected_outcome=""]
     * @param {number} [options.success_probability=0.0]
     * @param {number} [options.execution_time_estimate=0]
     * @param {string[]} [options.dependencies=[]]
     */
    constructor({
        tool,
        parameters = {},
        expected_outcome = "",
        success_probability = 0.0,
        execution_time_estimate = 0,
        dependencies = [],
    } = {}) {
        this.tool = tool;
        this.parameters = parameters;
        this.expected_outcome = expected_outcome;
        this.execution_time_estimate = execution_time_estimate;
        this.success_probability = success_probability;
        this.dependencies = dependencies;
    }

    toJSON() {
        return {
            tool: this.tool,
            parameters: this.parameters,
            expected_outcome: this.expected_outcome,
            success_probability: this.success_probability,
            execution_time_estimate: this.execution_time_estimate,
            dependencies: this.dependencies,

        }
    }

    /**
     * 
     * @param {number} [threshold=0.5] 
     * @returns {boolean}
     */
    isLikelySuccess(threshold = 0.5){
        return this.success_probability>=threshold;
    }

    /**
     * 
     * @returns {number}
     */
    estimateMillis(){
        return Math.round(this.execution_time_estimate*1000);
    }
}


export default AttackStep;