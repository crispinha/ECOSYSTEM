# ECOSYSTEM

[Video recording](https://www.youtube.com/watch?v=NmFEE5SzCkk)

ECOSYSTEM is a generative ambient piece built around a visual environment of simulated entities. Each entity, mimicking a fish or a bird, moves with the entities around it, creating flocks and swarms. The overall movement and energy of the environment controls the movement of the synthesis, creating a flowing soundscape connected with the visual elements.

The entites are controlled by the Boids algorithm, and ECOSYSTEM was an opportunity to use techniques from computer graphics in sonic arts.

Premiered at Sounds of Te Kōkī May 2022, created in Max/MSP and Javascript.

The `.maxpat` files contain the layout and interface and synthesis - [Max/MSP](https://cycling74.com/products/max) is required to open them but the trial version should work fine. The `.js` files contain the boids simulation and drawing code, and a simple vector math class. They are programmed against Max/MSP's Javascript extension libraries.