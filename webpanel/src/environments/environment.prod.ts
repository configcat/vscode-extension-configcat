const environmentConst = {
  production: true,
};

// NOTE: The bundler/minifier used by Angular aggressively optimizes the usage of constant variables and properties
// through a technique known as "constant folding". In some cases, it even optimizes parameter access within the
// function body when it detects that only constants are passed to the function via a specific parameter.
//
// This behavior can break our code in surprising ways because placeholders are replaced too late in the build process,
// after minificiation, which leads to constant folding being performed against the placeholders instead of the actual
// values.
//
// As there's no easy way to configure the bundler or customize Angular's internal build process, we resort to the
// following workaround, which creates a copy of the environment object that is not recognizable as a constant by the
// bundler:

export const environment = Object.keys(environmentConst)
  .reduce<Record<string, unknown>>(
    (acc, key) => (acc[key] = bypassConstantFolding(environmentConst[key as keyof typeof environmentConst]), acc),
    {}
  ) as typeof environmentConst;

function bypassConstantFolding<T>(value: T): T {
  // This function is to prevent unwanted code optimization.
  // See also: https://github.com/vitejs/vite/issues/1999
  return [value][0];
}
