import TargetProfile from './helper.TargetProfile.js'
import AttackStep from './helper.AttackStep.js'
//Represents a sequence of attacks for maximum impact
class AttackChain {
    /**
     * 
     * @param {Object} options
     * @param {TargetProfile} options.target_profile 
     */
    constructor({ target_profile } = {}) {
        this.target_profile = target_profile;
        this.steps = [];
        this.success_probability = 0.0;
        this.estimated_time = 0;
        this.required_tools = new Set();
        this.risk_level = "unknown";
    }
    /**
     * 
     * @param {AttackStep} step 
     */
    addStep(step) {
        if (!step) return;
        this.steps.push(step);
        if (step.tool) this.required_tools.add(step.tool);
        this.estimated_time += step.execution_time_estimate || 0;
    }

    /**
     * @returns {number}
     */
    calculateSuccessProbability() {
        if (!this.steps.length) {
            this.success_probability = 0.0;
            return this.success_probability;
        }

        let prob = 1.0;
        for (const step of this.steps) {
            const p = Math.min(1, Math.max(0, step.success_probability));
            prob *= p;
        }
        this.success_probability = prob;
        return this.success_probability;
    }

    toJSON() {
        return {
            target: this.target_profile?.target ?? null,
            steps: this.steps.map((s) => ({
                tool: s.tool,
                parameters: s.parameters,
                expected_outcome: s.expected_outcome,
                success_probability: s.success_probability,
                execution_time_estimate: s.execution_time_estimate,
                dependencies: s.dependencies,
            })),
            success_probability: this.success_probability,
            estimated_time: this.estimated_time,
            required_tools: Array.from(this.required_tools),
            risk_level: this.risk_level,
        }
    }
}

export default AttackChain;