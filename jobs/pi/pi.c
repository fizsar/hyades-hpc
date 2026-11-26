/* Cálculo de pi por integración numérica, repartido entre rangos MPI.
 * SPDX-License-Identifier: AGPL-3.0-only */
#include <mpi.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int main(int argc, char **argv) {
    long n = argc > 1 ? atol(argv[1]) : 100000000L;
    int rank, size, len;
    char host[MPI_MAX_PROCESSOR_NAME];

    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);
    MPI_Get_processor_name(host, &len);

    double t0 = MPI_Wtime();
    double h = 1.0 / (double)n, local = 0.0;
    for (long i = rank; i < n; i += size) {
        double x = h * ((double)i + 0.5);
        local += 4.0 / (1.0 + x * x);
    }
    local *= h;

    double pi = 0.0;
    MPI_Reduce(&local, &pi, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);
    printf("rango %d/%d en %s: parcial = %.12f\n", rank, size, host, local);
    fflush(stdout);
    MPI_Barrier(MPI_COMM_WORLD);
    if (rank == 0)
        printf("pi ~= %.12f (error %.2e) con %ld intervalos, %.2f s\n",
               pi, fabs(pi - M_PI), n, MPI_Wtime() - t0);
    MPI_Finalize();
    return 0;
}
