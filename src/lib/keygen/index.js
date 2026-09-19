export { asusSolver } from "./asus.js";
export { dellHddSolver, dellLatitude3540Solver, dellSolver, hddOldSolver } from "./dell/index.js";
export { fsi20DecNewSolver, fsi20DecOldSolver, fsi24DecSolver, fsiHexSolver, fsi24Hex203cSolver } from "./fsi.js";
export { hpAMISolver, hpMiniSolver } from "./hp.js";
export { acerInsyde10Solver, hpInsydeSolver, insydeSolver } from "./insyde.js";
export {
    phoenixFsiLSolver, phoenixFsiPSolver, phoenixFsiSolver,
    phoenixFsiSSolver, phoenixFsiXSolver, phoenixHPCompaqSolver, phoenixSolver
} from "./phoenix.js";
export { samsung44HexSolver, samsungSolver } from "./samsung.js";
export { sonySolver, sony4x4Solver } from "./sony.js";

import { asusSolver } from "./asus.js";
import { dellHddSolver, dellLatitude3540Solver, dellSolver, hddOldSolver } from "./dell/index.js";
import { fsi20DecNewSolver, fsi20DecOldSolver, fsi24DecSolver, fsiHexSolver, fsi24Hex203cSolver } from "./fsi.js";
import { hpAMISolver, hpMiniSolver } from "./hp.js";
import { acerInsyde10Solver, hpInsydeSolver, insydeSolver } from "./insyde.js";
import {
    phoenixFsiLSolver, phoenixFsiPSolver, phoenixFsiSolver,
    phoenixFsiSSolver, phoenixFsiXSolver, phoenixHPCompaqSolver, phoenixSolver
} from "./phoenix.js";
import { samsung44HexSolver, samsungSolver } from "./samsung.js";
import { sonySolver, sony4x4Solver } from "./sony.js";

export const solvers = [
    asusSolver,
    acerInsyde10Solver,
    sonySolver,
    sony4x4Solver,
    samsung44HexSolver,
    samsungSolver,
    hddOldSolver,
    dellSolver,
    dellHddSolver,
    dellLatitude3540Solver,
    fsiHexSolver,
    fsi20DecNewSolver,
    fsi20DecOldSolver,
    fsi24DecSolver,
    fsi24Hex203cSolver,
    hpMiniSolver,
    hpInsydeSolver,
    hpAMISolver,
    insydeSolver,
    phoenixSolver,
    phoenixHPCompaqSolver,
    phoenixFsiSolver,
    phoenixFsiLSolver,
    phoenixFsiPSolver,
    phoenixFsiSSolver,
    phoenixFsiXSolver
];

export function keygen(serial) {
    return solvers
        .map((solver) => {
            const startTime = performance.now();
            const passwords = solver(serial);
            const calcTime = performance.now() - startTime;
            return { solver, passwords, calcTime };
        })
        .filter((result) => result.passwords && result.passwords.length >= 1);
}
