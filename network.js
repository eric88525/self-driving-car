class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(
                neuronCounts[i], neuronCounts[i + 1]
            ));
        }
    }

    static feedForward(inputs, network) {
        let outputs = Level.feedForward(
            inputs, network.levels[0]
        );
        // pass outputs to next level
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(
                outputs, network.levels[i]
            );
        }
        return outputs;
    }
    // randomly create new weights amd biases
    static mutate(network,amount=1){
        network.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}


class Level {
    constructor(inputCount, outputCount) {
        // x
        this.inputs = new Array(inputCount);
        // y = wx + b
        this.outputs = new Array(outputCount);
        // b
        this.biases = new Array(outputCount);
        // w
        this.weights = [];

        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    static #randomize(level) {
        for(let i=0;i<level.inputs.length;i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++)
            level.biases[i] = Math.random() * 2 - 1;
    }

    static feedForward(inputs, level) {

        for (let i = 0; i < level.inputs.length; i++)
            level.inputs[i] = inputs[i];

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            // wx
            for (let j = 0; j < level.inputs.length; j++)
                sum += level.inputs[j] * level.weights[j][i];

            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}

