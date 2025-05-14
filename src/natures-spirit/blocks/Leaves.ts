///// VEry EXPIREMENTAl
// `import {
//   world,
//   BlockPermutation,
//   Block,
// } from "@minecraft/server";

// const allowedBlocks = ["minecraft:oak_log", "natures_spirit:aspen_log"];

// world.beforeEvents.worldInitialize.subscribe((eventData) => {
//   eventData.blockComponentRegistry.registerCustomComponent(
//     "natures_spirit:on_random_tick",
//     {
//       onRandomTick(e) {
//         const { block } = e;
//         const { x, y, z } = block.location;

//         const persistent = isConnectedToAllowedBlock(block, 4);

//         const currentStates = block.permutation.getAllStates();
//         const newStates = {
//           ...currentStates,
//           "natures_spirit:persistent_bit": persistent,
//         };
//         const newPermutation = BlockPermutation.resolve(
//           block.typeId,
//           newStates
//         );
//         block.setPermutation(newPermutation);

//         if (
//           !persistent &&
//           !block.permutation.getState("natures_spirit:placed" as any)
//         ) {
//           block.dimension.runCommand(`/setblock ${x} ${y} ${z} air destroy`);
//         }
//       },
//     }
//   );
// });

// function isConnectedToAllowedBlock(
//   block: Block,
//   maxDistance: number
// ): boolean {
//   const queue: Array<{ block: Block; dist: number }> = [{ block, dist: 0 }];
//   const visited = new Set<string>();

//   while (queue.length) {
//     const { block: currentBlock, dist } = queue.shift()!;
//     if (dist > maxDistance) continue;

//     const { x, y, z } = currentBlock.location;
//     const blockKey = `${x},${y},${z}`;
//     if (visited.has(blockKey)) continue;
//     visited.add(blockKey);

//     if (allowedBlocks.includes(currentBlock.typeId)) return true;

//     if (
//       currentBlock.typeId.startsWith("natures_spirit:") &&
//       currentBlock.typeId.endsWith("_leaves")
//     ) {
//       const persistentBit = currentBlock.permutation.getState(
//         "natures_spirit:persistent_bit" as any
//       );
//       if (persistentBit || dist === 0) {
//         for (const adjacentBlock of [
//           currentBlock.above(),
//           currentBlock.below(),
//           currentBlock.north(),
//           currentBlock.south(),
//           currentBlock.east(),
//           currentBlock.west(),
//         ]) {
//           if (
//             adjacentBlock &&
//             !visited.has(
//               `${adjacentBlock.location.x},${adjacentBlock.location.y},${adjacentBlock.location.z}`
//             )
//           ) {
//             queue.push({ block: adjacentBlock, dist: dist + 1 });
//           }
//         }
//       }
//     }
//   }
//   return false;
// }

// world.afterEvents.playerPlaceBlock.subscribe((eventData) => {
//   const { block } = eventData;

//   if (
//     block.typeId.startsWith("natures_spirit:") &&
//     block.typeId.endsWith("_leaves") &&
//     !block.permutation.getState("natures_spirit:placed" as any)
//   ) {
//     const currentStates = block.permutation.getAllStates();

//     const newStates = { ...currentStates, "natures_spirit:placed": true };

//     const newPermutation = BlockPermutation.resolve(block.typeId, newStates);

//     block.setPermutation(newPermutation);
//   }
// });
