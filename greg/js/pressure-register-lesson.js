export const PRESSURE_INTRO=Object.freeze([
 "This pressure sensor needs to record readings anywhere from zero to 300 kilopascals.",
 "We've got sixteen bits available, but using all sixteen would waste valuable storage.",
 "Your job is to find the smallest number of bits that can store every possible reading in that range.",
 "Try adjusting the simulated pressure and register width. If the stored value doesn't match the sensor reading, you're losing data!",
]);
export const PRESSURE_COMPLETE=["Nine bits! That gives us 512 possible values, from 0 to 511. Plenty for our pressure monitor!","And we didn't waste an extra bit. That's why choosing the right register width matters!"];
